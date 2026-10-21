package com.uade.tpo.Zenoirprod;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("dev") // siempre H2 en memoria: estas pruebas nunca tocan la base real
@AutoConfigureMockMvc
class AuthenticationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void permiteRegistrarseAutenticarseYUsarElToken() throws Exception {
        String registro = """
                {
                  "firstname": "Juan",
                  "lastname": "Rocca",
                  "dni": "40111222",
                  "fechaNacimiento": "2000-05-10",
                  "email": "juan@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        String respuestaRegistro = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonRegistro = objectMapper.readTree(respuestaRegistro);
        String tokenRegistro = jsonRegistro.get("access_token").asText();

        // El carrito se arma con el usuario del token: sin token no hay acceso.
        mockMvc.perform(post("/carritos"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/carritos")
                        .header("Authorization", "Bearer " + tokenRegistro))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/eventos")
                        .header("Authorization", "Bearer " + tokenRegistro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/eventos"))
                .andExpect(status().isOk());

        String ingreso = """
                {
                  "email": "juan@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ingreso))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty());
    }

    @Test
    void impideAccederAlCarritoDeOtroUsuario() throws Exception {
        String registroPropietario = """
                {
                  "firstname": "Propietario",
                  "lastname": "Carrito",
                  "dni": "40444555",
                  "fechaNacimiento": "2000-01-01",
                  "email": "propietario@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        String respuestaPropietario = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registroPropietario))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String tokenPropietario = objectMapper.readTree(respuestaPropietario)
                .get("access_token").asText();

        String respuestaCarrito = mockMvc.perform(post("/carritos")
                        .header("Authorization", "Bearer " + tokenPropietario))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Integer carritoId = objectMapper.readTree(respuestaCarrito).get("id").asInt();

        String registroOtroUsuario = """
                {
                  "firstname": "Otro",
                  "lastname": "Usuario",
                  "dni": "40555666",
                  "fechaNacimiento": "2000-01-01",
                  "email": "otro@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        String respuestaOtroUsuario = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registroOtroUsuario))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String tokenOtroUsuario = objectMapper.readTree(respuestaOtroUsuario)
                .get("access_token").asText();

        // El carrito se consulta siempre por el usuario del token: el otro usuario recibe el suyo, no el ajeno.
        mockMvc.perform(get("/carritos/activo")
                        .header("Authorization", "Bearer " + tokenOtroUsuario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(carritoId)));

        mockMvc.perform(get("/carritos/activo")
                        .header("Authorization", "Bearer " + tokenPropietario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(carritoId));
    }

    @Test
    void rechazaRegistroConDatosVacios() throws Exception {
        String registro = """
                {
                  "firstname": "",
                  "lastname": "Prueba",
                  "email": "email-invalido",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rechazaEmailRepetido() throws Exception {
        String registro = """
                {
                  "firstname": "Usuario",
                  "lastname": "Repetido",
                  "dni": "40222333",
                  "fechaNacimiento": "1999-08-15",
                  "email": "repetido@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isConflict());
    }

    @Test
    void rechazaCredencialesIncorrectas() throws Exception {
        String registro = """
                {
                  "firstname": "Usuario",
                  "lastname": "Ingreso",
                  "dni": "40333444",
                  "fechaNacimiento": "2001-02-20",
                  "email": "ingreso@zenoir.com",
                  "password": "Clave123!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isCreated());

        String ingreso = """
                {
                  "email": "ingreso@zenoir.com",
                  "password": "incorrecta"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ingreso))
                .andExpect(status().isUnauthorized());
    }
}
