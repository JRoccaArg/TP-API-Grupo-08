package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

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
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
class CarritosControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;

    @Autowired private CarritoRepository carritoRepository;
    @Autowired private CompraRepository compraRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private UserRepository userRepository;

    private Integer usuarioId;
    private Integer eteId;

    @BeforeEach
    void seed() {
        carritoRepository.deleteAll();
        // Se borra antes de EventoTipoEntrada: Compra tiene FK a traves de sus detalles
        // y puede haber quedado data de otras clases de test corriendo en la misma DB en memoria.
        compraRepository.deleteAll();
        eventoTipoEntradaRepository.deleteAll();
        eventosRepository.deleteAll();
        tipoEntradaRepository.deleteAll();
        locationRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .email("franco@test.com")
                .password("secret")
                .name("Franco")
                .firstName("Franco")
                .lastName("Churba")
                .role(Role.USER)
                .build();
        usuarioId = userRepository.save(user).getId();

        Locacion locacion = new Locacion();
        locacion.setNombre("Groove");
        locacion.setDireccion("Av. Santa Fe 4389");
        locacion.setCapacidadMax(500);
        locacion = locationRepository.save(locacion);

        TipoEntrada tipoEntrada = new TipoEntrada();
        tipoEntrada.setNombre("General");
        tipoEntrada.setDescripcionBase("Acceso general");
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
        ete.setPrecio(new BigDecimal("10000.00"));
        ete.setPorcentajeDescuento(BigDecimal.ZERO);
        ete.setCantidadTotal(10);
        ete.setCantidadDisponible(10);
        ete.setFechaInicioVenta(LocalDateTime.now().minusDays(1));
        ete.setFechaFinVenta(LocalDateTime.now().plusDays(20));
        ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        eteId = eventoTipoEntradaRepository.save(ete).getId();
    }

    private Integer crearCarrito() throws Exception {
        String body = mockMvc.perform(post("/carritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuarioId", usuarioId))))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asInt();
    }

    @Test
    void obtenerOCrear_sinCarritoActivo_creaUnoNuevo() throws Exception {
        mockMvc.perform(post("/carritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuarioId", usuarioId))))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.estado", is("ACTIVO")))
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.usuario.password").doesNotExist());
    }

    @Test
    void obtenerOCrear_conCarritoActivoExistente_devuelveElMismo() throws Exception {
        Integer primerId = crearCarrito();

        String body = mockMvc.perform(post("/carritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuarioId", usuarioId))))
                .andReturn().getResponse().getContentAsString();
        Integer segundoId = json.readTree(body).get("id").asInt();

        org.assertj.core.api.Assertions.assertThat(segundoId).isEqualTo(primerId);
    }

    @Test
    void obtenerOCrear_sinUsuarioId_devuelve400() throws Exception {
        mockMvc.perform(post("/carritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerOCrear_usuarioInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/carritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuarioId", 999999))))
                .andExpect(status().isNotFound());
    }

    @Test
    void agregarItem_happyPath_devuelveCarritoConElItem() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(
                                Map.of("eventoTipoEntradaId", eteId, "cantidad", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].cantidad", is(2)))
                .andExpect(jsonPath("$.items[0].eventoTipoEntrada.id", is(eteId)));
    }

    @Test
    void agregarItem_mismoTipoEntradaDosVeces_sumaCantidades() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 2))));

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].cantidad", is(5)));
    }

    @Test
    void agregarItem_cantidadCero_devuelve400() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 0))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void agregarItem_eventoTipoEntradaInexistente_devuelve404() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", 999999, "cantidad", 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void agregarItem_stockInsuficiente_devuelve409() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 11))))
                .andExpect(status().isConflict());
    }

    @Test
    void agregarItem_carritoInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/carritos/999999/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void actualizarCantidad_happyPath_actualizaElItem() throws Exception {
        Integer carritoId = crearCarrito();
        String body = mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 1))))
                .andReturn().getResponse().getContentAsString();
        Integer itemId = json.readTree(body).get("items").get(0).get("id").asInt();

        mockMvc.perform(patch("/carritos/" + carritoId + "/items/" + itemId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("cantidad", 4))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].cantidad", is(4)));
    }

    @Test
    void actualizarCantidad_itemInexistente_devuelve404() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(patch("/carritos/" + carritoId + "/items/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("cantidad", 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void quitarItem_happyPath_dejaElCarritoSinItems() throws Exception {
        Integer carritoId = crearCarrito();
        String body = mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 1))))
                .andReturn().getResponse().getContentAsString();
        Integer itemId = json.readTree(body).get("items").get(0).get("id").asInt();

        mockMvc.perform(delete("/carritos/" + carritoId + "/items/" + itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    void vaciar_conVariosItems_dejaElCarritoVacio() throws Exception {
        Integer carritoId = crearCarrito();
        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 2))));

        mockMvc.perform(post("/carritos/" + carritoId + "/vaciar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    void abandonar_marcaElCarritoComoAbandonado() throws Exception {
        Integer carritoId = crearCarrito();

        mockMvc.perform(post("/carritos/" + carritoId + "/abandonar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("ABANDONADO")));
    }

    @Test
    void agregarItem_sobreCarritoAbandonado_devuelve409() throws Exception {
        Integer carritoId = crearCarrito();
        mockMvc.perform(post("/carritos/" + carritoId + "/abandonar"));

        mockMvc.perform(post("/carritos/" + carritoId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("eventoTipoEntradaId", eteId, "cantidad", 1))))
                .andExpect(status().isConflict());
    }

    @Test
    void getCarritoPorId_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/carritos/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCarritosPorUsuario_devuelveLosDelUsuario() throws Exception {
        crearCarrito();

        mockMvc.perform(get("/carritos").param("usuarioId", usuarioId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
