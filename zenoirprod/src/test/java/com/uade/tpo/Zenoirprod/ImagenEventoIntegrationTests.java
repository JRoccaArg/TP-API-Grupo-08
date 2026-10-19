package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenEventoRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.service.ImagenEventoService;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

@SpringBootTest
@ActiveProfiles("dev") // siempre H2 en memoria: estas pruebas nunca tocan la base real
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "ADMIN")
class ImagenEventoIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private EventosRepository eventosRepository;

    @Autowired
    private ImagenEventoRepository imagenEventoRepository;

    @Autowired
    private ImagenEventoService imagenEventoService;

    @Test
    void devuelveCreatedAlSubirUnaImagen() throws Exception {
        Evento evento = crearEvento("Evento imagen");
        String token = registrarUsuario();
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "portada.png", "image/png", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/eventos/{eventoId}/imagenes", evento.getId())
                        .file(archivo)
                        .param("tipoImagenEvento", "PORTADA")
                        .param("orden", "1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern(
                        "/eventos/" + evento.getId() + "/imagenes/[0-9]+")));
    }

    @Test
    void listaLasImagenesPorOrdenAscendente() throws Exception {
        Evento evento = crearEvento("Evento orden");
        guardarImagen(evento, "tercera.png", 3);
        guardarImagen(evento, "primera.png", 1);
        guardarImagen(evento, "segunda.png", 2);

        List<ImagenEvento> imagenes = imagenEventoService
                .getImagenesPorEventoId(evento.getId(), PageRequest.of(0, 10)).getContent();

        assertEquals(1, imagenes.get(0).getOrden());
        assertEquals(2, imagenes.get(1).getOrden());
        assertEquals(3, imagenes.get(2).getOrden());
    }

    private String registrarUsuario() throws Exception {
        String registro = """
                {
                  "firstname": "Imagen",
                  "lastname": "Prueba",
                  "dni": "40999888",
                  "fechaNacimiento": "2000-01-01",
                  "email": "imagen@zenoir.com",
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

    private Evento crearEvento(String titulo) {
        Category categoria = new Category("Fiesta", true);
        categoria = categoryRepository.save(categoria);

        Locacion locacion = new Locacion();
        locacion.setNombre("Salon");
        locacion.setDireccion("Calle 123");
        locacion = locationRepository.save(locacion);

        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion("Descripcion");
        evento.setEstado("ACTIVO");
        evento.setLocacion(locacion);
        evento.setCategoria(categoria);
        evento.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(1));
        evento.setFechaHoraFin(FechaCatalogo.ahora().plusDays(1).plusHours(5));
        return eventosRepository.save(evento);
    }

    private void guardarImagen(Evento evento, String nombre, Integer orden) {
        ImagenEvento imagen = new ImagenEvento();
        imagen.setEvento(evento);
        imagen.setNombreArchivo(nombre);
        imagen.setTipoContenido("image/png");
        imagen.setTamanio(3L);
        imagen.setDatos(new byte[] {1, 2, 3});
        imagen.setTipoImagenEvento(TipoImagenEvento.GALERIA);
        imagen.setOrden(orden);
        imagenEventoRepository.save(imagen);
    }
}
