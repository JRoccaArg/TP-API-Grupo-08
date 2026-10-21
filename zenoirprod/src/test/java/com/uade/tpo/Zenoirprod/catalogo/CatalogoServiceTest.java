package com.uade.tpo.Zenoirprod.catalogo;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.service.EventosServiceImp;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceTest {
    @Mock EventosRepository repository;
    @InjectMocks EventosServiceImp service;
    final PageRequest pagina = PageRequest.of(1, 6);

    @Test void listadoHistoricoConservaPaginacion() throws Exception {
        when(repository.findAll(pagina)).thenReturn(Page.empty(pagina));
        service.getEventos(pagina, null, null, null, null, false, false);
        verify(repository).findAll(pagina);
        verifyNoMoreInteractions(repository);
    }
    @Test void combinaFiltrosNormalizaYEscapaComodines() throws Exception {
        when(repository.buscar(eq("%musica!%!_!!![%"), eq(3), eq(BigDecimal.ZERO), eq(BigDecimal.TEN),
                eq(true), eq(false), eq(false), any(LocalDateTime.class), eq(pagina))).thenReturn(Page.empty(pagina));
        Page<Evento> resultado = service.getEventos(pagina, " MÚSICA%_![ ", 3, BigDecimal.ZERO, BigDecimal.TEN, true, false);
        assertThat(resultado).isNotNull();
        verify(repository).buscar(eq("%musica!%!_!!![%"), eq(3), eq(BigDecimal.ZERO), eq(BigDecimal.TEN),
                eq(true), eq(false), eq(false), any(LocalDateTime.class), eq(pagina));
        verifyNoMoreInteractions(repository);
    }
    @ParameterizedTest
    @CsvSource({"-1,10,1", "0,-1,1", "10,1,1", "0,10,0", "0,10,-1"})
    void rechazaFiltrosInvalidosSinConsultarBase(String min, String max, Integer categoria) {
        assertThatThrownBy(() -> service.getEventos(pagina, null, categoria,
                new BigDecimal(min), new BigDecimal(max), true, false)).isInstanceOf(EventoInvalidoException.class);
        verifyNoInteractions(repository);
    }
    @Test void detalleDevuelveEventoExistente() throws Exception {
        Evento evento = new Evento(); evento.setId(7);
        when(repository.findById(7)).thenReturn(Optional.of(evento));
        assertThat(service.getEventoPorId(7)).contains(evento);
    }
    @Test void detalleInexistenteLanzaErrorDeNegocio() {
        when(repository.findById(7)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getEventoPorId(7)).isInstanceOf(EventoInexistenteException.class);
    }
    @Test void rechazaEstadoYOrdenInvalidos() {
        assertThatThrownBy(() -> service.getCatalogo(pagina, null, null, null, null, "borrador", "proximos"))
                .isInstanceOf(EventoInvalidoException.class);
        assertThatThrownBy(() -> service.getCatalogo(pagina, null, null, null, null, "todos", "inventado"))
                .isInstanceOf(EventoInvalidoException.class);
        verifyNoInteractions(repository);
    }
}
