package com.uade.tpo.Zenoirprod.catalogo;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import com.uade.tpo.Zenoirprod.entity.*;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.service.EventosServiceImp;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;

@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false",
        "spring.datasource.url=${TEST_DB_URL}", "spring.datasource.username=${TEST_DB_USER}",
        "spring.datasource.password=${TEST_DB_PASSWORD}"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "TEST_DB_URL", matches = "jdbc:sqlserver:.*")
@ActiveProfiles("sqlsrv")
@Import(EventosServiceImp.class)
class CatalogoRepositoryTest {
    @Autowired TestEntityManager em;
    @Autowired EventosRepository repository;
    @Autowired EventosServiceImp service;
    final LocalDateTime ahora = LocalDateTime.of(2026, 10, 17, 12, 0);
    Category musica, cine;
    Locacion lugar;

    @BeforeEach void preparar() {
        musica = em.persist(new Category("Música", true));
        cine = em.persist(new Category("Cine", true));
        lugar = new Locacion(); lugar.setNombre("Palacio"); lugar.setDireccion("Quintana 161"); lugar.setCapacidadMax(800);
        em.persist(lugar);
    }
    Evento evento(String nombre, String estado, Category categoria) {
        Evento e = new Evento(); e.setTitulo(nombre); e.setEstado(estado); e.setCategoria(categoria); e.setLocacion(lugar);
        e.setFechaHoraInicio(ahora.plusDays(10)); e.setFechaHoraFin(ahora.plusDays(11)); return em.persist(e);
    }
    EventoTipoEntrada oferta(Evento e, String precio, String descuento) {
        TipoEntrada tipo = new TipoEntrada(); tipo.setNombre("Tipo " + System.nanoTime()); tipo.setDescripcionBase("General"); tipo.setActivo(true); em.persist(tipo);
        EventoTipoEntrada o = new EventoTipoEntrada(); o.setEvento(e); o.setTipoEntrada(tipo);
        o.setPrecio(new BigDecimal(precio)); o.setPorcentajeDescuento(new BigDecimal(descuento));
        o.setCantidadTotal(10); o.setCantidadDisponible(10); o.setEstado(EventoTipoEntrada.EstadoEventoTipoEntrada.ACTIVO);
        o.setFechaInicioVenta(ahora.minusDays(1)); o.setFechaFinVenta(ahora.plusDays(1)); return em.persist(o);
    }
    Page<Evento> buscar(String nombre, Integer categoria, String min, String max, int page, int size) {
        em.flush();
        return repository.buscar(nombre, categoria, min == null ? null : new BigDecimal(min),
                max == null ? null : new BigDecimal(max), true, false, ahora, PageRequest.of(page, size));
    }
    @Test void filtraAntesDePaginarYCuentaSinDuplicados() {
        evento("Otro", "ACTIVO", cine);
        for (int i = 0; i < 7; i++) { Evento e = evento("Jazz " + i, "ACTIVO", musica); oferta(e, "100", "15"); oferta(e, "200", "50"); }
        evento("Jazz borrador", "BORRADOR", musica);
        Page<Evento> primera = buscar("%jazz%", musica.getId(), "85", "100", 0, 6);
        Page<Evento> segunda = buscar("%jazz%", musica.getId(), "85", "100", 1, 6);
        assertThat(primera.getTotalElements()).isEqualTo(7); assertThat(primera.getTotalPages()).isEqualTo(2);
        assertThat(primera.getContent()).hasSize(6); assertThat(segunda.getContent()).hasSize(1);
        assertThat(primera.getContent()).extracting(Evento::getId).doesNotContain(segunda.getContent().get(0).getId());
    }
    @Test void ambosExtremosCorrespondenALaMismaOferta() {
        Evento e = evento("Rango", "ACTIVO", musica); oferta(e, "10", "0"); oferta(e, "100", "0");
        assertThat(buscar("%", null, "20", "90", 0, 6).getContent()).isEmpty();
        assertThat(buscar("%", null, "100", "100", 0, 6).getContent()).containsExactly(e);
    }
    @Test void redondeaElDescuentoAntesDeRestarloYAdmiteGratis() {
        Evento centavos = evento("Centavos", "ACTIVO", musica); oferta(centavos, "0.05", "10");
        Evento gratis = evento("Gratis", "ACTIVO", cine); oferta(gratis, "100", "100");
        assertThat(buscar("%", null, "0.04", "0.04", 0, 6).getContent()).containsExactly(centavos);
        assertThat(buscar("%", null, "0", "0", 0, 6).getContent()).containsExactly(gratis);
    }
    @Test void excluyeOfertasNoVendiblesSoloAlFiltrarPrecio() {
        for (String caso : new String[]{"agotado", "pausado", "futuro", "cerrado", "cancelado"}) {
            Evento e = evento(caso, caso.equals("cancelado") ? "CANCELADO" : "ACTIVO", musica);
            EventoTipoEntrada o = oferta(e, "100", "0");
            switch (caso) {
                case "agotado" -> { o.setCantidadDisponible(0); o.setEstado(EventoTipoEntrada.EstadoEventoTipoEntrada.AGOTADO); }
                case "pausado" -> o.setEstado(EventoTipoEntrada.EstadoEventoTipoEntrada.PAUSADO);
                case "futuro" -> o.setFechaInicioVenta(ahora.plusHours(1));
                case "cerrado" -> o.setFechaFinVenta(ahora.minusHours(1));
                default -> { }
            }
        }
        assertThat(buscar("%", null, "100", "100", 0, 6).getContent()).isEmpty();
        assertThat(buscar("%", null, null, null, 0, 6).getTotalElements()).isEqualTo(5);
    }
    @Test void incluyeLimitesDeVentanaDeVenta() {
        Evento e = evento("Limites", "ACTIVO", musica); EventoTipoEntrada o = oferta(e, "100", "0");
        o.setFechaInicioVenta(ahora); o.setFechaFinVenta(ahora);
        assertThat(buscar("%", null, "100", "100", 0, 6).getContent()).containsExactly(e);
    }
    @Test void normalizaMayusculasTildesYBuscaComodinesLiteralmente() throws Exception {
        Evento e = evento("FOTOGRAFÍA 100%_!", "ACTIVO", musica);
        assertThat(service.getEventos(PageRequest.of(0, 6), " fotografia ", null, null, null, true, false).getContent()).containsExactly(e);
        assertThat(service.getEventos(PageRequest.of(0, 6), "%_!", null, null, null, true, false).getContent()).containsExactly(e);
        Evento corchetes = evento("[A-Z]", "ACTIVO", musica);
        assertThat(service.getEventos(PageRequest.of(0, 6), "[A-Z]", null, null, null, true, false).getContent()).containsExactly(corchetes);
        assertThat(service.getEventos(PageRequest.of(0, 6), "inexistente", null, null, null, true, false).getContent()).isEmpty();
    }
    @Test void listadoHistoricoConservaBorradoresYProximoEsGlobal() throws Exception {
        Evento borrador = evento("Borrador", "BORRADOR", musica);
        Evento tarde = evento("Tarde", "ACTIVO", musica);
        Evento temprano = evento("Temprano", "ACTIVO", cine); temprano.setFechaHoraInicio(ahora.plusDays(1));
        assertThat(service.getEventos(PageRequest.of(0, 20), null, null, null, null, false, false).getContent()).contains(borrador);
        assertThat(repository.buscar("%", null, null, null, false, true, ahora, PageRequest.of(0, 1)).getContent()).containsExactly(temprano);
        assertThat(buscar("%", null, null, null, 99, 6).getContent()).isEmpty();
    }
    @Test void rechazaFiltrosInvalidosEnService() {
        assertThatThrownBy(() -> service.getEventos(PageRequest.of(0, 6), null, null, new BigDecimal("-1"), null, true, false)).isInstanceOf(EventoInvalidoException.class);
        assertThatThrownBy(() -> service.getEventos(PageRequest.of(0, 6), null, null, BigDecimal.TEN, BigDecimal.ONE, true, false)).isInstanceOf(EventoInvalidoException.class);
        assertThatThrownBy(() -> service.getEventos(PageRequest.of(0, 6), null, 0, null, null, true, false)).isInstanceOf(EventoInvalidoException.class);
    }
}
