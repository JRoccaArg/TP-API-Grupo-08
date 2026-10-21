package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.exceptions.CategoryEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenEventoRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.service.CategoryService;
import com.uade.tpo.Zenoirprod.service.EventosService;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("dev") // H2 en memoria, nunca la base real
@Transactional
class EventosCategoriasIntegrationTests {

    @Autowired
    private EventosService eventosService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private EventosRepository eventosRepository;

    @Autowired
    private ImagenEventoRepository imagenEventoRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void eliminaImagenesAlEliminarEventoPeroConservaCategoria() throws Exception {
        Category categoria = categoryService.createCategory("Electronica", true);
        Evento evento = crearEvento("Evento cascada", categoria);

        ImagenEvento imagen = new ImagenEvento();
        imagen.setEvento(evento);
        imagen.setNombreArchivo("prueba.png");
        imagen.setTipoContenido("image/png");
        imagen.setTamanio(3L);
        imagen.setDatos(new byte[] {1, 2, 3});
        imagen.setTipoImagenEvento(TipoImagenEvento.PORTADA);
        imagen = imagenEventoRepository.save(imagen);

        Integer imagenId = imagen.getId();
        Integer eventoId = evento.getId();
        Integer categoriaId = categoria.getId();
        entityManager.flush();
        entityManager.clear();

        eventosService.deleteEvento(eventoId);
        entityManager.flush();

        assertFalse(eventosRepository.existsById(eventoId));
        assertFalse(imagenEventoRepository.existsById(imagenId));
        assertTrue(categoryRepository.existsById(categoriaId));
    }

    @Test
    void permiteVariosEventosEnLaMismaCategoria() throws Exception {
        Category categoria = categoryService.createCategory("Fiesta", null);
        Evento primerEvento = crearEvento("Primer evento", categoria);
        Evento segundoEvento = crearEvento("Segundo evento", categoria);

        assertEquals(categoria.getId(), primerEvento.getCategoria().getId());
        assertEquals(categoria.getId(), segundoEvento.getCategoria().getId());
        assertEquals(true, categoria.getActivo());
        assertThrows(CategoryEnUsoException.class,
                () -> categoryService.deleteCategory(categoria.getId()));
    }

    @Test
    void rechazaDatosInvalidosAlCrearEvento() {
        LocalDateTime inicio = FechaCatalogo.ahora().plusDays(1);
        LocalDateTime fin = inicio.plusHours(5);

        assertThrows(EventoInvalidoException.class,
                () -> eventosService.crearEvento("", null, "ACTIVO", null, null, inicio, fin));
        assertThrows(EventoInvalidoException.class,
                () -> eventosService.crearEvento("Evento", null, "OTRO", 1, 1, inicio, fin));
    }

    private Evento crearEvento(String titulo, Category categoria) {
        Locacion locacion = new Locacion();
        locacion.setNombre("Salon " + titulo);
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
}
