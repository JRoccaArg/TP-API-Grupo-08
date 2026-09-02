package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;

@Service
public class EventosServiceImp implements EventosService {
    
    @Autowired
    private EventosRepository eventosRepository;
    @Autowired
    private LocationRepository locacionRepository;


    public Page<Evento> getEventos(PageRequest pageRequest) {
        return eventosRepository.findAll(pageRequest);
    }


    public Optional<Evento> getEventoPorId(Integer id) throws EventoInexistenteException {
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        return eventosRepository.findById(id);
    }



    public void deleteEvento(Integer id) throws EventoInexistenteException {
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        eventosRepository.deleteById(id);
    }

    public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws LocacionInexsistenteException, TituloEventoEnUsoException, FechaEventoInvalidaException {
        if (!locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (eventosRepository.findAll().stream().anyMatch(evento -> evento.getTitulo().equals(titulo))) {
            throw new TituloEventoEnUsoException();
        }
        validarFechas(fechaHoraInicio, fechaHoraFin, true);

        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion(descripcion);
        evento.setEstado(estado);
        evento.setLocacion(locacionRepository.findById(locacion_id).get());
        evento.setFechaHoraInicio(fechaHoraInicio);
        evento.setFechaHoraFin(fechaHoraFin);
        return eventosRepository.save(evento);
    }

    public Evento updateEvento(Integer id, String titulo, String descripcion, String estado, Integer locacion_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws EventoInexistenteException, LocacionInexsistenteException,
            TituloEventoEnUsoException, FechaEventoInvalidaException {
        // Validaciones Previas a Updatear
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        if (titulo != null && eventosRepository.findAll().stream().anyMatch(evento -> evento.getTitulo().equals(titulo) && !evento.getId().equals(id))) {
            throw new TituloEventoEnUsoException();
        }
        if (locacion_id != null && !locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }

        Evento ev = eventosRepository.findById(id).get();
        boolean huboCambios = false;

        if (fechaHoraInicio != null || fechaHoraFin != null) {
            LocalDateTime inicioFinal = fechaHoraInicio != null ? fechaHoraInicio : ev.getFechaHoraInicio();
            LocalDateTime finFinal = fechaHoraFin != null ? fechaHoraFin : ev.getFechaHoraFin();
            validarFechas(inicioFinal, finFinal, fechaHoraInicio != null);
        }

        // Update del Evento
        if (titulo != null) {
            ev.setTitulo(titulo);
            huboCambios = true;
        }
        if (descripcion != null) {
            ev.setDescripcion(descripcion);
            huboCambios = true;
        }
        if (estado != null) {
            ev.setEstado(estado);
            huboCambios = true;
        }
        if (locacion_id != null) {
            ev.setLocacion(locacionRepository.findById(locacion_id).get());
            huboCambios = true;
        }
        if (fechaHoraInicio != null) {
            ev.setFechaHoraInicio(fechaHoraInicio);
            huboCambios = true;
        }
        if (fechaHoraFin != null) {
            ev.setFechaHoraFin(fechaHoraFin);
            huboCambios = true;
        }
        
        // Guardo si hubo cambios, sino devuelvo el evento original
        if (huboCambios) {
            return eventosRepository.save(ev);
        } else {
            return eventosRepository.findById(id).get();
        }
    }

    private void validarFechas(LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin,
            boolean validarInicioFuturo) throws FechaEventoInvalidaException {
        if (fechaHoraInicio == null || fechaHoraFin == null
                || !fechaHoraFin.isAfter(fechaHoraInicio)
                || (validarInicioFuturo && fechaHoraInicio.isBefore(LocalDateTime.now()))) {
            throw new FechaEventoInvalidaException();
        }
    }
}
