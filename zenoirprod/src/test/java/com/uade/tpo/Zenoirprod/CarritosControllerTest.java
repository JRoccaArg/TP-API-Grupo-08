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
import java.util.Map;

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

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = TestFixtures.EMAIL_COMPRADOR, roles = "USER")
class CarritosControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;

    @Autowired private TestFixtures fixtures;

    private Integer usuarioId;
    private Integer eteId;

    @BeforeEach
    void seed() {
        fixtures.limpiar();
        TestFixtures.Escenario esc = fixtures.crearEscenarioBase();
        usuarioId = esc.usuarioId;
        // 10 unidades para conservar el caso de stock insuficiente con cantidad 11
        Evento evento = fixtures.crearEvento("Fiesta Carrito", "ACTIVO");
        eteId = fixtures.crearTipoEntradaParaEvento(
                evento, "General", new BigDecimal("10000.00"), BigDecimal.ZERO, 10);
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
