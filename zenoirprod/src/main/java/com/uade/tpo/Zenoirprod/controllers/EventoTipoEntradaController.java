package com.uade.tpo.Zenoirprod.controllers;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.service.EventoTipoEntradaService;

@RestController
@RequestMapping("eventosTiposEntrada")
public class EventoTipoEntradaController {

    @Autowired
    private EventoTipoEntradaService eventoTipoEntradaService;

    @PostMapping
    public ResponseEntity<EventoTipoEntrada> crear(@RequestBody EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInvalidoException, EventoTipoEntradaDuplicadoException,
            EventoInexistenteException, TipoEntradaInexistenteException {
        EventoTipoEntrada creado = eventoTipoEntradaService.crear(request);
        return ResponseEntity.created(URI.create("/eventosTiposEntrada/" + creado.getId())).body(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoTipoEntrada> getPorId(@PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException {
        return ResponseEntity.ok(eventoTipoEntradaService.getPorId(id));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<EventoTipoEntrada>> getPorEvento(@PathVariable Integer eventoId)
            throws EventoInexistenteException {
        return ResponseEntity.ok(eventoTipoEntradaService.getPorEvento(eventoId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventoTipoEntrada> actualizar(@PathVariable Integer id,
            @RequestBody EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException {
        return ResponseEntity.ok(eventoTipoEntradaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException {
        eventoTipoEntradaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/precio")
    public ResponseEntity<BigDecimal> getPrecioFinal(@PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException {
        return ResponseEntity.ok(eventoTipoEntradaService.getPrecioFinal(id));
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<Boolean> hayDisponibilidad(@PathVariable Integer id,
            @RequestParam Integer cantidad) throws EventoTipoEntradaInexistenteException {
        return ResponseEntity.ok(eventoTipoEntradaService.hayDisponibilidad(id, cantidad));
    }
}
