package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;

public interface EventosService {
        public Page<Evento> getEventos(PageRequest pageRequest);

        public Page<Evento> getEventos(PageRequest pageRequest, String nombre, Integer categoriaId,
                        BigDecimal precioMin, BigDecimal precioMax, boolean catalogo, boolean proximo,
                        boolean antiguosPrimero) throws EventoInvalidoException;

        default Page<Evento> getEventos(PageRequest pageRequest, String nombre, Integer categoriaId,
                        BigDecimal precioMin, BigDecimal precioMax, boolean catalogo, boolean proximo)
                        throws EventoInvalidoException {
                return getEventos(pageRequest, nombre, categoriaId, precioMin, precioMax, catalogo, proximo, false);
        }

        public Page<Evento> getCatalogo(PageRequest pageRequest, String nombre, Integer categoriaId,
                        BigDecimal precioMin, BigDecimal precioMax, String estadoEvento, String orden) throws EventoInvalidoException;

        public BigDecimal precioMaximoCatalogo();

        public int finalizarVencidos();

        public void deleteEvento(Integer id) throws EventoInexistenteException, EventoEnUsoException;

        public Optional<Evento> getEventoPorId(Integer id) throws EventoInexistenteException;

        public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
                        LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
                        throws TituloEventoEnUsoException, LocacionInexsistenteException,
                        FechaEventoInvalidaException, EventoInvalidoException, CategoryInexistenteException;

        public Evento updateEvento(Integer id, String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
                        LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
                        throws EventoInexistenteException, LocacionInexsistenteException,
                        TituloEventoEnUsoException, FechaEventoInvalidaException,
                        EventoInvalidoException, CategoryInexistenteException;
}
