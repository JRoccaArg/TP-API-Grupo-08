package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class TicketsControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;

    @Autowired private CompraRepository compraRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private UserRepository userRepository;

    private Integer ticketId;
    private String ticketCodigoQr;

    @BeforeEach
    void seedYComprar() throws Exception {
        compraRepository.deleteAll();
        ticketRepository.deleteAll();
        eventoTipoEntradaRepository.deleteAll();
        eventosRepository.deleteAll();
        tipoEntradaRepository.deleteAll();
        locationRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .email("valen@test.com").password("secret").name("Valen")
                .firstName("Valentin").lastName("Carriaga").role(Role.USER).build();
        Integer usuarioId = userRepository.save(user).getId();

        Locacion locacion = new Locacion();
        locacion.setNombre("Groove"); locacion.setDireccion("x"); locacion.setCapacidadMax(500);
        locacion = locationRepository.save(locacion);

        TipoEntrada tipoEntrada = new TipoEntrada();
        tipoEntrada.setNombre("VIP"); tipoEntrada.setDescripcionBase("d"); tipoEntrada.setActivo(true);
        tipoEntrada = tipoEntradaRepository.save(tipoEntrada);

        Evento evento = new Evento();
        evento.setTitulo("Fiesta"); evento.setDescripcion("d"); evento.setEstado("ACTIVO");
        evento.setLocacion(locacion);
        evento.setFechaHoraInicio(LocalDateTime.now().plusDays(30));
        evento.setFechaHoraFin(LocalDateTime.now().plusDays(30).plusHours(7));
        evento = eventosRepository.save(evento);

        EventoTipoEntrada ete = new EventoTipoEntrada();
        ete.setEvento(evento); ete.setTipoEntrada(tipoEntrada);
        ete.setPrecio(new BigDecimal("10000.00"));
        ete.setPorcentajeDescuento(BigDecimal.ZERO);
        ete.setCantidadTotal(50); ete.setCantidadDisponible(50);
        ete.setFechaInicioVenta(LocalDateTime.now().minusDays(1));
        ete.setFechaFinVenta(LocalDateTime.now().plusDays(20));
        ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        Integer eteId = eventoTipoEntradaRepository.save(ete).getId();

        String body = json.writeValueAsString(java.util.Map.of(
                "usuarioId", usuarioId,
                "items", java.util.List.of(java.util.Map.of(
                        "eventoTipoEntradaId", eteId, "cantidad", 1))));
        String respuesta = mockMvc.perform(post("/compras")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        var ticketNode = json.readTree(respuesta).get("detalles").get(0).get("tickets").get(0);
        ticketId = ticketNode.get("id").asInt();
        ticketCodigoQr = ticketNode.get("codigoQr").asText();
    }

    @Test
    void getPorId_existente_devuelveTicket() throws Exception {
        mockMvc.perform(get("/tickets/" + ticketId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(ticketId)))
                .andExpect(jsonPath("$.estado", is("EMITIDO")))
                .andExpect(jsonPath("$.codigoQr", is(ticketCodigoQr)));
    }

    @Test
    void getPorId_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/tickets/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getPorCodigoQr_existente_devuelveTicket() throws Exception {
        mockMvc.perform(get("/tickets/qr/" + ticketCodigoQr))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(ticketId)));
    }

    @Test
    void getPorCodigoQr_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/tickets/qr/no-existe-este-qr"))
                .andExpect(status().isNotFound());
    }

    @Test
    void utilizar_ticketEmitido_marcaComoUtilizado() throws Exception {
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("UTILIZADO")))
                .andExpect(jsonPath("$.fechaUtilizacion", notNullValue()));
    }

    @Test
    void utilizar_ticketYaUtilizado_devuelve409() throws Exception {
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar")).andExpect(status().isOk());
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar")).andExpect(status().isConflict());
    }

    @Test
    void utilizar_codigoInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/tickets/qr/qr-que-no-existe/utilizar"))
                .andExpect(status().isNotFound());
    }
}
