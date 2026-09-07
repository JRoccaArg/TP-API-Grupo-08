package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;

@Service
public class EventosServiceImp implements EventosService {
    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "BORRADOR", "ACTIVO", "FINALIZADO", "CANCELADO", "REPROGRAMADO");

    
    @Autowired
    private EventosRepository eventosRepository;
    @Autowired
    private LocationRepository locacionRepository;
    @Autowired
    private CategoryRepository categoryRepository;


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

    public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws LocacionInexsistenteException, TituloEventoEnUsoException,
            FechaEventoInvalidaException, EventoInvalidoException, CategoryInexistenteException {
        validarDatosEvento(titulo, estado, locacion_id, categoria_id);
        if (!locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (!categoryRepository.existsById(categoria_id)) {
            throw new CategoryInexistenteException();
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
        evento.setCategoria(categoryRepository.findById(categoria_id).get());
        evento.setFechaHoraInicio(fechaHoraInicio);
        evento.setFechaHoraFin(fechaHoraFin);
        return eventosRepository.save(evento);
    }

    public Evento updateEvento(Integer id, String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws EventoInexistenteException, LocacionInexsistenteException,
            TituloEventoEnUsoException, FechaEventoInvalidaException,
            EventoInvalidoException, CategoryInexistenteException {
        // Validaciones Previas a Updatear
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        if (titulo != null && titulo.isBlank()) {
            throw new EventoInvalidoException();
        }
        if (estado != null && !ESTADOS_VALIDOS.contains(estado)) {
            throw new EventoInvalidoException();
        }
        if (titulo != null && eventosRepository.findAll().stream().anyMatch(evento -> evento.getTitulo().equals(titulo) && !evento.getId().equals(id))) {
            throw new TituloEventoEnUsoException();
        }
        if (locacion_id != null && !locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (categoria_id != null && !categoryRepository.existsById(categoria_id)) {
            throw new CategoryInexistenteException();
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
        if (categoria_id != null) {
            ev.setCategoria(categoryRepository.findById(categoria_id).get());
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

    private void validarDatosEvento(String titulo, String estado, Integer locacionId, Integer categoriaId)
            throws EventoInvalidoException {
        if (titulo == null || titulo.isBlank()
                || estado == null || !ESTADOS_VALIDOS.contains(estado)
                || locacionId == null || categoriaId == null) {
            throw new EventoInvalidoException();
        }
    }
}
