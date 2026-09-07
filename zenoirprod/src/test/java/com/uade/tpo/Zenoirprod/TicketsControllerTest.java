package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = TestFixtures.EMAIL_COMPRADOR, roles = "USER")
class TicketsControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper json;
    @Autowired private TestFixtures fixtures;

    private Integer ticketId;
    private String ticketCodigoQr;

    @BeforeEach
    void seedYComprar() throws Exception {
        fixtures.limpiar();
        TestFixtures.Escenario esc = fixtures.crearEscenarioBase();

        String body = json.writeValueAsString(Map.of(
                "usuarioId", esc.usuarioId,
                "items", List.of(Map.of("eventoTipoEntradaId", esc.eteId, "cantidad", 1))));
        String respuesta = mockMvc.perform(post("/compras")
                        .with(user(TestFixtures.EMAIL_COMPRADOR).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        var ticket = json.readTree(respuesta).get("detalles").get(0).get("tickets").get(0);
        ticketId = ticket.get("id").asInt();
        ticketCodigoQr = ticket.get("codigoQr").asText();
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
        mockMvc.perform(get("/tickets/999999")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void getPorCodigoQr_existente_devuelveTicket() throws Exception {
        mockMvc.perform(get("/tickets/qr/" + ticketCodigoQr))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(ticketId)));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void getPorCodigoQr_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/tickets/qr/no-existe-este-qr")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void utilizar_ticketEmitido_marcaComoUtilizado() throws Exception {
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("UTILIZADO")))
                .andExpect(jsonPath("$.fechaUtilizacion", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void utilizar_ticketYaUtilizado_devuelve409() throws Exception {
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar")).andExpect(status().isOk());
        mockMvc.perform(post("/tickets/qr/" + ticketCodigoQr + "/utilizar")).andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void utilizar_codigoInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/tickets/qr/qr-que-no-existe/utilizar"))
                .andExpect(status().isNotFound());
    }
}
