package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;

public interface EventosService {
        public Page<Evento> getEventos(PageRequest pageRequest);

        public void deleteEvento(Integer id) throws EventoInexistenteException;

        public Optional<Evento> getEventoPorId(Integer id) throws EventoInexistenteException;

        public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id,
                        LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
                        throws TituloEventoEnUsoException, LocacionInexsistenteException, FechaEventoInvalidaException;

        public Evento updateEvento(Integer id, String titulo, String descripcion, String estado, Integer locacion_id,
                        LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
                        throws EventoInexistenteException, LocacionInexsistenteException,
                        TituloEventoEnUsoException, FechaEventoInvalidaException;
}
