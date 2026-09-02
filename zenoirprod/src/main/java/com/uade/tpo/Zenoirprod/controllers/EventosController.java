package com.uade.tpo.Zenoirprod.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EventoRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.service.EventosService;

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
    ) {
        if (page == null || size == null) 
            return ResponseEntity.ok(eventosService.getEventos(PageRequest.of(0, Integer.MAX_VALUE)));
        return ResponseEntity.ok(eventosService.getEventos(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Evento>> getEventoPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(eventosService.getEventoPorId(id));
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity patchEvento(@PathVariable Integer id, @RequestBody EventoRequest eventoRequest) {
        try {
            return ResponseEntity.ok(eventosService.updateEvento(id, eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                    eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getFecha_hora()));
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); //Esta version de Spring no tiene ResponseEntity.conflict()
        }
    }
    

    @DeleteMapping("/{id}")
    public ResponseEntity deleteEvento(@PathVariable Integer id) {
        try {
            eventosService.deleteEvento(id);
            return ResponseEntity.noContent().build();
        } catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping()
    public ResponseEntity<Evento> postMethodName(@RequestBody EventoRequest eventoRequest) {
        try {
            return ResponseEntity.ok(eventosService.crearEvento(eventoRequest.getTitulo(), eventoRequest.getDescripcion(), 
            eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getFecha_hora()));
        } 
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (TituloEventoEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); //Esta version de Spring no tiene ResponseEntity.conflict()
        }
    }
    
}
