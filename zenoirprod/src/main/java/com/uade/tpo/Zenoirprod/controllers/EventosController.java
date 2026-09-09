package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EventoRequest;
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
    public ResponseEntity getEventos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) throws PaginacionInvalidaException {
        return ResponseEntity.ok(eventosService.getEventos(PageableFactory.crear(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> getEventoPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(eventosService.getEventoPorId(id)
                    .orElseThrow(EventoInexistenteException::new));
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity patchEvento(@PathVariable Integer id, @RequestBody EventoRequest eventoRequest) {
        try {
            return ResponseEntity.ok(eventosService.updateEvento(id, eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                    eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                    eventoRequest.getFechaHoraFin()));
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); //Esta version de Spring no tiene ResponseEntity.conflict()
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
    public ResponseEntity deleteEvento(@PathVariable Integer id) {
        try {
            eventosService.deleteEvento(id);
            return ResponseEntity.noContent().build();
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (EventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Evento> crearEvento(@RequestBody EventoRequest eventoRequest) {
        try {
            Evento creado = eventosService.crearEvento(eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
            eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
            eventoRequest.getFechaHoraFin());
            return ResponseEntity.created(URI.create("/eventos/" + creado.getId())).body(creado);
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); //Esta version de Spring no tiene ResponseEntity.conflict()
        }
        catch (FechaEventoInvalidaException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (EventoInvalidoException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (CategoryInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
}
