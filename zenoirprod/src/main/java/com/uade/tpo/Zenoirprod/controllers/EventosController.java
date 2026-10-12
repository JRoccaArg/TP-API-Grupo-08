package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EventoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.EventoResponse;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.service.EventosService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("eventos")
public class EventosController {
    @Autowired
    private EventosService eventosService;

    @GetMapping
    public ResponseEntity<Page<EventoResponse>> getEventos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) throws PaginacionInvalidaException {
        Page<Evento> pagina = eventosService.getEventos(PageableFactory.crear(page, size));
        return ResponseEntity.ok(pagina.map(EventoResponse::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponse> getEventoPorId(@PathVariable Integer id)
            throws EventoInexistenteException {
        return eventosService.getEventoPorId(id)
                .map(EventoResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseThrow(EventoInexistenteException::new);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> patchEvento(@PathVariable Integer id, @RequestBody EventoRequest eventoRequest)
            throws EventoInexistenteException, LocacionInexsistenteException, TituloEventoEnUsoException,
            FechaEventoInvalidaException, EventoInvalidoException, CategoryInexistenteException {
        Evento actualizado = eventosService.updateEvento(id, eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                eventoRequest.getFechaHoraFin());
        return ResponseEntity.ok(EventoResponse.fromEntity(actualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvento(@PathVariable Integer id)
            throws EventoInexistenteException, EventoEnUsoException {
        eventosService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> postEvento(@RequestBody EventoRequest eventoRequest)
            throws LocacionInexsistenteException, TituloEventoEnUsoException, FechaEventoInvalidaException,
            EventoInvalidoException, CategoryInexistenteException {
        Evento creado = eventosService.crearEvento(eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                eventoRequest.getFechaHoraFin());
        return ResponseEntity.created(URI.create("/eventos/" + creado.getId()))
                .body(EventoResponse.fromEntity(creado));
    }

}
