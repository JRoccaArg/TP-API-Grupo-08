package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = TestFixtures.EMAIL_COMPRADOR, roles = "USER")
class ComprasControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;
    @Autowired private TestFixtures fixtures;

    private TestFixtures.Escenario esc;

    @BeforeEach
    void seed() {
        fixtures.limpiar();
        esc = fixtures.crearEscenarioBase();
    }

    private String bodyCrear(int cantidad) throws Exception {
        return json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "items", List.of(Map.of("eventoTipoEntradaId", esc.eteId, "cantidad", cantidad))));
    }

    private Integer crearCompra(int cantidad) throws Exception {
        String body = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(cantidad)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asInt();
    }

    @Test
    void crearCompra_happyPath_totalYTicketsCorrectos() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(2)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.estado", is("CONFIRMADA")))
                .andExpect(jsonPath("$.total", is(27000.00)))
                .andExpect(jsonPath("$.detalles", hasSize(1)))
                .andExpect(jsonPath("$.detalles[0].precioUnitario", is(13500.00)))
                .andExpect(jsonPath("$.detalles[0].subtotal", is(27000.00)))
                .andExpect(jsonPath("$.detalles[0].tickets", hasSize(2)))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado", is("EMITIDO")))
                .andExpect(jsonPath("$.detalles[0].tickets[0].codigoQr", not(emptyOrNullString())))
                .andExpect(jsonPath("$.usuario.password").doesNotExist());
    }

    @Test
    void crearCompra_decrementaStock() throws Exception {
        crearCompra(3);
        Assertions.assertThat(fixtures.getTipoEntrada(esc.eteId).getCantidadDisponible()).isEqualTo(97);
    }

    @Test
    void crearCompra_sinDescuento_usaPrecioBase() throws Exception {
        EventoTipoEntrada ete = fixtures.getTipoEntrada(esc.eteId);
        ete.setPorcentajeDescuento(BigDecimal.ZERO);
        fixtures.guardarTipoEntrada(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total", is(30000.00)))
                .andExpect(jsonPath("$.detalles[0].precioUnitario", is(15000.00)));
    }

    @Test
    void crearCompra_alAgotarStock_marcaTipoEntradaComoAgotado() throws Exception {
        crearCompra(100);
        EventoTipoEntrada ete = fixtures.getTipoEntrada(esc.eteId);
        Assertions.assertThat(ete.getCantidadDisponible()).isZero();
        Assertions.assertThat(ete.getEstado()).isEqualTo(EstadoEventoTipoEntrada.AGOTADO);
    }

    @Test
    void precioConDescuento_usaLaMismaFormulaQueElCatalogo() throws Exception {

        Evento evento = fixtures.crearEvento("Fiesta Redondeo", "ACTIVO");
        Integer eteId = fixtures.crearTipoEntradaParaEvento(
                evento, "Redondeo", new BigDecimal("107.45"), new BigDecimal("10.00"), 10);

        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "items", List.of(Map.of("eventoTipoEntradaId", eteId, "cantidad", 1))));

        String respuesta = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        BigDecimal precioCobrado = json.readTree(respuesta)
                .get("detalles").get(0).get("precioUnitario").decimalValue();

        Assertions.assertThat(precioCobrado)
                .as("107.45 con 10 por ciento: 107.45 - round(10.745) = 96.70")
                .isEqualByComparingTo(new BigDecimal("96.70"));
    }

    @Test
    void crearCompra_siFallaUnItem_noDescuentaStockDeLosAnteriores() throws Exception {
        Evento evento = fixtures.crearEvento("Fiesta Rollback", "ACTIVO");
        Integer conStock = fixtures.crearTipoEntradaParaEvento(
                evento, "A", new BigDecimal("1000.00"), BigDecimal.ZERO, 50);
        Integer sinStock = fixtures.crearTipoEntradaParaEvento(
                evento, "B", new BigDecimal("1000.00"), BigDecimal.ZERO, 1);

        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "items", List.of(
                        Map.of("eventoTipoEntradaId", conStock, "cantidad", 5),
                        Map.of("eventoTipoEntradaId", sinStock, "cantidad", 99))));

        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());

        Assertions.assertThat(fixtures.getTipoEntrada(conStock).getCantidadDisponible())
                .as("el stock del primer item debe volver atras cuando falla el segundo")
                .isEqualTo(50);
    }

    @Test
    void crearCompra_itemsVacio_devuelve400() throws Exception {
        String body = json.writeValueAsString(Map.of("usuarioId", esc.usuarioId, "items", List.of()));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_cantidadCero_devuelve400() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(0)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_itemNull_devuelve400() throws Exception {

        String body = "{\"usuarioId\":" + esc.usuarioId + ",\"items\":[null]}";
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_listaDeItemsConNullAlFinal_devuelve400() throws Exception {
        String body = "{\"usuarioId\":" + esc.usuarioId + ",\"items\":["
                + "{\"eventoTipoEntradaId\":" + esc.eteId + ",\"cantidad\":1},null]}";
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_sinItems_null_devuelve400() throws Exception {
        String body = json.writeValueAsString(
                java.util.Collections.singletonMap("usuarioId", esc.usuarioId));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_usuarioInexistente_devuelve404() throws Exception {
        String body = json.writeValueAsString(Map.of(
                "usuarioId", 999999,
                "items", List.of(Map.of("eventoTipoEntradaId", esc.eteId, "cantidad", 1))));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCompra_eventoTipoEntradaInexistente_devuelve404() throws Exception {
        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "items", List.of(Map.of("eventoTipoEntradaId", 999999, "cantidad", 1))));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCompra_stockInsuficiente_devuelve409() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(101)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_tipoEntradaPausado_devuelve409() throws Exception {
        EventoTipoEntrada ete = fixtures.getTipoEntrada(esc.eteId);
        ete.setEstado(EstadoEventoTipoEntrada.PAUSADO);
        fixtures.guardarTipoEntrada(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_eventoCancelado_devuelve409() throws Exception {
        fixtures.cancelarEvento(esc.eventoId);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_ventaTodaviaNoAbierta_devuelve409() throws Exception {
        EventoTipoEntrada ete = fixtures.getTipoEntrada(esc.eteId);
        ete.setFechaInicioVenta(java.time.LocalDateTime.now().plusDays(5));
        fixtures.guardarTipoEntrada(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_ventaYaCerrada_devuelve409() throws Exception {
        EventoTipoEntrada ete = fixtures.getTipoEntrada(esc.eteId);
        ete.setFechaFinVenta(java.time.LocalDateTime.now().minusDays(1));
        fixtures.guardarTipoEntrada(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_carritoInexistente_devuelve404() throws Exception {
        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "carritoId", 999999,
                "items", List.of(Map.of("eventoTipoEntradaId", esc.eteId, "cantidad", 1))));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCompra_carritoDeOtroUsuario_devuelve403() throws Exception {
        var otro = fixtures.crearUsuario("otro@test.com", com.uade.tpo.Zenoirprod.entity.Role.USER);
        Integer carritoAjeno = fixtures.crearCarrito(otro).getId();

        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "carritoId", carritoAjeno,
                "items", List.of(Map.of("eventoTipoEntradaId", esc.eteId, "cantidad", 1))));
        mockMvc.perform(post("/compras").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCompraPorId_existente_devuelveCompra() throws Exception {
        Integer id = crearCompra(1);
        mockMvc.perform(get("/compras/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(id)))
                .andExpect(jsonPath("$.estado", is("CONFIRMADA")));
    }

    @Test
    void getCompraPorId_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/compras/999999")).andExpect(status().isNotFound());
    }

    @Test
    void getComprasPorUsuario_devuelveHistorial() throws Exception {
        crearCompra(1);
        crearCompra(1);
        mockMvc.perform(get("/compras").param("usuarioId", esc.usuarioId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void cancelar_eventoNoCancelado_devuelve409_yNoDevuelveStock() throws Exception {
        Integer id = crearCompra(3);

        mockMvc.perform(post("/compras/" + id + "/cancelar"))
                .andExpect(status().isConflict());

        Assertions.assertThat(fixtures.getTipoEntrada(esc.eteId).getCantidadDisponible())
                .as("sin cancelacion del evento no hay devolucion, el stock no vuelve")
                .isEqualTo(97);
    }

    @Test
    void cancelar_eventoCancelado_cancelaLaCompraYDevuelveStock() throws Exception {
        Integer id = crearCompra(3);
        fixtures.cancelarEvento(esc.eventoId);

        mockMvc.perform(post("/compras/" + id + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("CANCELADA")))
                .andExpect(jsonPath("$.fechaCancelacion", notNullValue()))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado", is("CANCELADO")));

        Assertions.assertThat(fixtures.getTipoEntrada(esc.eteId).getCantidadDisponible())
                .isEqualTo(100);
    }

    @Test
    void cancelar_conTicketYaUtilizado_noDevuelveEsaUnidadAlStock() throws Exception {
        String body = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(3)))
                .andReturn().getResponse().getContentAsString();
        Integer id = json.readTree(body).get("id").asInt();
        String qrUsado = json.readTree(body)
                .get("detalles").get(0).get("tickets").get(0).get("codigoQr").asText();

        mockMvc.perform(post("/tickets/qr/" + qrUsado + "/utilizar")
                .with(user("admin@test.com").roles("ADMIN")))
                .andExpect(status().isOk());

        fixtures.cancelarEvento(esc.eventoId);
        mockMvc.perform(post("/compras/" + id + "/cancelar")).andExpect(status().isOk());

        Assertions.assertThat(fixtures.getTipoEntrada(esc.eteId).getCantidadDisponible())
                .as("solo vuelven al stock los 2 tickets sin usar, no el que ya se consumio")
                .isEqualTo(99);
    }

    @Test
    void cancelar_dosVeces_devuelve409() throws Exception {
        Integer id = crearCompra(1);
        fixtures.cancelarEvento(esc.eventoId);

        mockMvc.perform(post("/compras/" + id + "/cancelar")).andExpect(status().isOk());
        mockMvc.perform(post("/compras/" + id + "/cancelar")).andExpect(status().isConflict());
    }

    @Test
    void cancelar_inexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/compras/999999/cancelar")).andExpect(status().isNotFound());
    }
}
