package com.uade.tpo.Zenoirprod.catalogo;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.uade.tpo.Zenoirprod.controllers.EventosController;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.*;
import com.uade.tpo.Zenoirprod.service.EventosService;

// Contrato HTTP del catálogo; no valida los filtros de Spring Security.
@ExtendWith(MockitoExtension.class)
class CatalogoControllerTest {
    @Mock EventosService service;
    @InjectMocks EventosController controller;
    MockMvc mvc;
    @BeforeEach void preparar() {
        mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new ManejadorErrores()).build();
    }
    @Test void enviaFiltrosYDevuelvePaginaConTotales() throws Exception {
        Evento e = new Evento(); e.setId(7); e.setTitulo("Jazz");
        when(service.getEventos(PageRequest.of(1,6), "Jazz", 2, new BigDecimal("0"), new BigDecimal("9000"), true, false, false))
            .thenReturn(new PageImpl<>(List.of(e), PageRequest.of(1,6), 7));
        mvc.perform(get("/eventos").param("page","1").param("size","6").param("nombre","Jazz")
                .param("categoriaId","2").param("precioMin","0").param("precioMax","9000").param("catalogo","true"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].id").value(7))
            .andExpect(jsonPath("$.number").value(1)).andExpect(jsonPath("$.size").value(6))
            .andExpect(jsonPath("$.totalElements").value(7)).andExpect(jsonPath("$.totalPages").value(2));
    }
    @ParameterizedTest @CsvSource({"-1,6", "0,0", "0,101", "abc,6"})
    void rechazaPaginacionInvalida(String page, String size) throws Exception {
        mvc.perform(get("/eventos").param("page",page).param("size",size))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
        verifyNoInteractions(service);
    }
    @Test void exigePageYSizeJuntos() throws Exception {
        mvc.perform(get("/eventos").param("page","0")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
    @Test void devuelve404ConMensajeParaEventoInexistente() throws Exception {
        when(service.getEventoPorId(999)).thenThrow(new EventoInexistenteException());
        mvc.perform(get("/eventos/999")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("El evento no existe"));
    }
    @Test void devuelveDetalleSinExponerEntidadCompleta() throws Exception {
        Evento e = new Evento(); e.setId(7); e.setTitulo("Jazz"); e.setDescripcion("Una noche de jazz");
        when(service.getEventoPorId(7)).thenReturn(Optional.of(e));
        mvc.perform(get("/eventos/7")).andExpect(status().isOk())
            .andExpect(jsonPath("$.titulo").value("Jazz")).andExpect(jsonPath("$.descripcion").value("Una noche de jazz"))
            .andExpect(jsonPath("$.imagenes").doesNotExist());
    }
    @Test void traduceValidacionDelServicioA400() throws Exception {
        when(service.getEventos(any(), any(), any(), any(), any(), anyBoolean(), anyBoolean(), anyBoolean()))
            .thenThrow(new EventoInvalidoException());
        mvc.perform(get("/eventos").param("precioMin","10").param("precioMax","1"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.path").value("/eventos"));
    }
    @Test void sinResultadosDevuelveListaVaciaYTotalCero() throws Exception {
        when(service.getEventos(any(), any(), any(), any(), any(), anyBoolean(), anyBoolean(), anyBoolean()))
            .thenReturn(new PageImpl<Evento>(List.of(), PageRequest.of(0,6), 0));
        mvc.perform(get("/eventos").param("page","0").param("size","6"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));
    }
}
