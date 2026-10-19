package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInvalidaException;
import com.uade.tpo.Zenoirprod.repository.ImagenLocacionRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.service.ImagenLocacionService;
import com.uade.tpo.Zenoirprod.service.LocacionService;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("dev") // siempre H2 en memoria: estas pruebas nunca tocan la base real
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "ADMIN")
class ImagenLocacionIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ImagenLocacionRepository imagenLocacionRepository;

    @Autowired
    private ImagenLocacionService imagenLocacionService;

    @Autowired
    private LocacionService locacionService;

    @Autowired
    private EntityManager entityManager;

    @Test
    void devuelveCreatedAlSubirUnaImagen() throws Exception {
        Locacion locacion = crearLocacion();
        String token = registrarUsuario();
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "salon.png", "image/png", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/locaciones/{locacionId}/imagenes", locacion.getId())
                        .file(archivo)
                        .param("textoAlternativo", "Interior del salon")
                        .param("orden", "1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern(
                        "/locaciones/" + locacion.getId() + "/imagenes/[0-9]+")))
                .andExpect(jsonPath("$.fechaCreacion").isNotEmpty());
    }

    @Test
    void listaLasImagenesPorOrdenAscendente() throws Exception {
        Locacion locacion = crearLocacion();
        guardarImagen(locacion, "tercera.png", 3);
        guardarImagen(locacion, "primera.png", 1);
        guardarImagen(locacion, "segunda.png", 2);

        List<ImagenLocacion> imagenes = imagenLocacionService
                .getImagenesPorLocacionId(locacion.getId(), PageRequest.of(0, 10)).getContent();

        assertEquals(1, imagenes.get(0).getOrden());
        assertEquals(2, imagenes.get(1).getOrden());
        assertEquals(3, imagenes.get(2).getOrden());
    }

    @Test
    void rechazaUnArchivoQueNoEsImagen() {
        Locacion locacion = crearLocacion();
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "archivo.txt", "text/plain", new byte[] {1, 2, 3});

        assertThrows(ImagenLocacionInvalidaException.class,
                () -> imagenLocacionService.crearImagenLocacion(
                        archivo, "Archivo invalido", locacion.getId(), 1));
    }

    @Test
    void eliminaLasImagenesAlEliminarLaLocacion() throws Exception {
        Locacion locacion = crearLocacion();
        ImagenLocacion imagen = guardarImagen(locacion, "salon.png", 1);
        Integer locacionId = locacion.getId();
        Integer imagenId = imagen.getId();
        entityManager.flush();
        entityManager.clear();

        locacionService.deleteLocacion(locacionId);
        entityManager.flush();

        assertFalse(locationRepository.existsById(locacionId));
        assertFalse(imagenLocacionRepository.existsById(imagenId));
    }

    private String registrarUsuario() throws Exception {
        String registro = """
                {
                  "firstname": "Locacion",
                  "lastname": "Imagen",
                  "dni": "40888777",
                  "fechaNacimiento": "2000-01-01",
                  "email": "locacion.imagen@zenoir.com",
                  "password": "clave123"
                }
                """;

        String respuesta = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(respuesta);
        return json.get("access_token").asText();
    }

    private Locacion crearLocacion() {
        Locacion locacion = new Locacion();
        locacion.setNombre("Salon");
        locacion.setDireccion("Calle 123");
        return locationRepository.save(locacion);
    }

    private ImagenLocacion guardarImagen(Locacion locacion, String nombre, Integer orden) {
        ImagenLocacion imagen = new ImagenLocacion();
        imagen.setLocacion(locacion);
        imagen.setNombreArchivo(nombre);
        imagen.setTipoContenido("image/png");
        imagen.setTamanio(3L);
        imagen.setDatos(new byte[] {1, 2, 3});
        imagen.setTextoAlternativo("Salon");
        imagen.setOrden(orden);
        imagen.setFechaCreacion(FechaCatalogo.ahora());
        return imagenLocacionRepository.save(imagen);
    }
}
