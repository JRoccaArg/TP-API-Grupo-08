package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TicketRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
class ComprasControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;

    @Autowired private CompraRepository compraRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private UserRepository userRepository;

    private Integer usuarioId;
    private Integer eteId;

    @BeforeEach
    void seed() {
        compraRepository.deleteAll();
        ticketRepository.deleteAll();
        eventoTipoEntradaRepository.deleteAll();
        eventosRepository.deleteAll();
        tipoEntradaRepository.deleteAll();
        locationRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .email("valen@test.com")
                .password("secret")
                .name("Valen")
                .firstName("Valentin")
                .lastName("Carriaga")
                .role(Role.USER)
                .build();
        usuarioId = userRepository.save(user).getId();

        Locacion locacion = new Locacion();
        locacion.setNombre("Groove");
        locacion.setDireccion("Av. Santa Fe 4389");
        locacion.setCapacidadMax(500);
        locacion = locationRepository.save(locacion);

        TipoEntrada tipoEntrada = new TipoEntrada();
        tipoEntrada.setNombre("VIP");
        tipoEntrada.setDescripcionBase("Barra libre");
        tipoEntrada.setActivo(true);
        tipoEntrada = tipoEntradaRepository.save(tipoEntrada);

        Evento evento = new Evento();
        evento.setTitulo("Fiesta Zenoir");
        evento.setDescripcion("Techno all night");
        evento.setEstado("ACTIVO");
        evento.setLocacion(locacion);
        evento.setFechaHoraInicio(LocalDateTime.now().plusDays(30));
        evento.setFechaHoraFin(LocalDateTime.now().plusDays(30).plusHours(7));
        evento = eventosRepository.save(evento);

        EventoTipoEntrada ete = new EventoTipoEntrada();
        ete.setEvento(evento);
        ete.setTipoEntrada(tipoEntrada);
        ete.setPrecio(new BigDecimal("15000.00"));
        ete.setPorcentajeDescuento(new BigDecimal("10.00"));
        ete.setCantidadTotal(100);
        ete.setCantidadDisponible(100);
        ete.setFechaInicioVenta(LocalDateTime.now().minusDays(1));
        ete.setFechaFinVenta(LocalDateTime.now().plusDays(20));
        ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        eteId = eventoTipoEntradaRepository.save(ete).getId();
    }

    private String bodyCrear(int cantidad) throws Exception {
        return json.writeValueAsString(java.util.Map.of(
                "usuarioId", usuarioId,
                "items", java.util.List.of(java.util.Map.of(
                        "eventoTipoEntradaId", eteId,
                        "cantidad", cantidad
                ))
        ));
    }

    @Test
    void crearCompra_happyPath_devuelve201_conTotalCalculadoYTicketsGenerados() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(2)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.estado", is("CONFIRMADA")))
                // 15000 * 0.9 * 2 = 27000.00
                .andExpect(jsonPath("$.total", is(27000.00)))
                .andExpect(jsonPath("$.detalles", hasSize(1)))
                .andExpect(jsonPath("$.detalles[0].cantidad", is(2)))
                .andExpect(jsonPath("$.detalles[0].precioUnitario", is(13500.00)))
                .andExpect(jsonPath("$.detalles[0].subtotal", is(27000.00)))
                .andExpect(jsonPath("$.detalles[0].tickets", hasSize(2)))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado", is("EMITIDO")))
                .andExpect(jsonPath("$.detalles[0].tickets[0].codigoQr", not(emptyOrNullString())))
                .andExpect(jsonPath("$.detalles[0].tickets[1].codigoQr", not(emptyOrNullString())))
                // password del usuario debe estar oculto en la respuesta
                .andExpect(jsonPath("$.usuario.password").doesNotExist());
    }

    @Test
    void crearCompra_decrementaStockDelEventoTipoEntrada() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(3)))
                .andExpect(status().isCreated());

        EventoTipoEntrada refrescado = eventoTipoEntradaRepository.findById(eteId).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(refrescado.getCantidadDisponible()).isEqualTo(97);
    }

    @Test
    void crearCompra_sinDescuento_usaPrecioBase() throws Exception {
        EventoTipoEntrada ete = eventoTipoEntradaRepository.findById(eteId).orElseThrow();
        ete.setPorcentajeDescuento(BigDecimal.ZERO);
        eventoTipoEntradaRepository.save(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total", is(30000.00)))
                .andExpect(jsonPath("$.detalles[0].precioUnitario", is(15000.00)));
    }

    @Test
    void crearCompra_itemsVacio_devuelve400() throws Exception {
        String body = json.writeValueAsString(java.util.Map.of(
                "usuarioId", usuarioId,
                "items", java.util.List.of()
        ));
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_cantidadCero_devuelve400() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(0)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearCompra_usuarioInexistente_devuelve404() throws Exception {
        String body = json.writeValueAsString(java.util.Map.of(
                "usuarioId", 999999,
                "items", java.util.List.of(java.util.Map.of(
                        "eventoTipoEntradaId", eteId,
                        "cantidad", 1))));
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCompra_eventoTipoEntradaInexistente_devuelve404() throws Exception {
        String body = json.writeValueAsString(java.util.Map.of(
                "usuarioId", usuarioId,
                "items", java.util.List.of(java.util.Map.of(
                        "eventoTipoEntradaId", 999999,
                        "cantidad", 1))));
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCompra_stockInsuficiente_devuelve409() throws Exception {
        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(101)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCompra_eventoTipoEntradaPausado_devuelve409() throws Exception {
        EventoTipoEntrada ete = eventoTipoEntradaRepository.findById(eteId).orElseThrow();
        ete.setEstado(EstadoEventoTipoEntrada.PAUSADO);
        eventoTipoEntradaRepository.save(ete);

        mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(1)))
                .andExpect(status().isConflict());
    }

    @Test
    void getCompraPorId_existente_devuelveCompra() throws Exception {
        String body = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(1)))
                .andReturn().getResponse().getContentAsString();
        Integer id = json.readTree(body).get("id").asInt();

        mockMvc.perform(get("/compras/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(id)))
                .andExpect(jsonPath("$.estado", is("CONFIRMADA")));
    }

    @Test
    void getCompraPorId_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/compras/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getComprasPorUsuario_devuelveHistorial() throws Exception {
        mockMvc.perform(post("/compras")
                .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)));
        mockMvc.perform(post("/compras")
                .contentType(MediaType.APPLICATION_JSON).content(bodyCrear(1)));

        mockMvc.perform(get("/compras").param("usuarioId", usuarioId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void cancelarCompra_restauraStockYCancelaTickets() throws Exception {
        String body = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(3)))
                .andReturn().getResponse().getContentAsString();
        Integer id = json.readTree(body).get("id").asInt();

        // stock quedo en 97
        mockMvc.perform(post("/compras/" + id + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("CANCELADA")))
                .andExpect(jsonPath("$.fechaCancelacion", notNullValue()))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado", is("CANCELADO")));

        EventoTipoEntrada refrescado = eventoTipoEntradaRepository.findById(eteId).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(refrescado.getCantidadDisponible()).isEqualTo(100);
    }

    @Test
    void cancelarCompra_yaCancelada_devuelve409() throws Exception {
        String body = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear(1)))
                .andReturn().getResponse().getContentAsString();
        Integer id = json.readTree(body).get("id").asInt();

        mockMvc.perform(post("/compras/" + id + "/cancelar")).andExpect(status().isOk());
        mockMvc.perform(post("/compras/" + id + "/cancelar")).andExpect(status().isConflict());
    }

    @Test
    void cancelarCompra_inexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/compras/999999/cancelar"))
                .andExpect(status().isNotFound());
    }
}
