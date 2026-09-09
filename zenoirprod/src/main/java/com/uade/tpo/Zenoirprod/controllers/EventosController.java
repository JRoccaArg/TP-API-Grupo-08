package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EventoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.EventoResponse;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
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
    public ResponseEntity<EventoResponse> getEventoPorId(@PathVariable Integer id) {
        try {
            return eventosService.getEventoPorId(id)
                    .map(EventoResponse::fromEntity)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> patchEvento(@PathVariable Integer id, @RequestBody EventoRequest eventoRequest) {
        try {
            Evento actualizado = eventosService.updateEvento(id, eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                    eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                    eventoRequest.getFechaHoraFin());
            return ResponseEntity.ok(EventoResponse.fromEntity(actualizado));
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (FechaEventoInvalidaException e) {
            return ResponseEntity.badRequest().build();
        } catch (EventoInvalidoException e) {
            return ResponseEntity.badRequest().build();
        } catch (CategoryInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvento(@PathVariable Integer id) {
        try {
            eventosService.deleteEvento(id);
            return ResponseEntity.noContent().build();
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> postEvento(@RequestBody EventoRequest eventoRequest) {
        try {
            Evento creado = eventosService.crearEvento(eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                    eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                    eventoRequest.getFechaHoraFin());
            return ResponseEntity.ok(EventoResponse.fromEntity(creado));
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (FechaEventoInvalidaException e) {
            return ResponseEntity.badRequest().build();
        } catch (EventoInvalidoException e) {
            return ResponseEntity.badRequest().build();
        } catch (CategoryInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
