package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.TipoEntradaRequest;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.service.TipoEntradaService;

@RestController
@RequestMapping("tiposEntrada")
public class TipoEntradasController {

    @Autowired
    private TipoEntradaService tipoEntradaService;

    @GetMapping
    public ResponseEntity getTiposEntrada(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page == null || size == null)
            return ResponseEntity.ok(tipoEntradaService.getTiposEntrada(PageRequest.of(0, Integer.MAX_VALUE)));
        return ResponseEntity.ok(tipoEntradaService.getTiposEntrada(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoEntrada> getTipoEntradaPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(tipoEntradaService.getTipoEntradaPorId(id));
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<TipoEntrada> crearTipoEntrada(@RequestBody TipoEntradaRequest tipoEntradaRequest) {
        return ResponseEntity.ok(tipoEntradaService.crearTipoEntrada(
                tipoEntradaRequest.getNombre(),
                tipoEntradaRequest.getDescripcionBase(),
                tipoEntradaRequest.getActivo()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoEntrada> updateTipoEntrada(@PathVariable Integer id,
            @RequestBody TipoEntradaRequest tipoEntradaRequest) {
        try {
            return ResponseEntity.ok(tipoEntradaService.updateTipoEntrada(
                    id,
                    tipoEntradaRequest.getNombre(),
                    tipoEntradaRequest.getDescripcionBase(),
                    tipoEntradaRequest.getActivo()));
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteTipoEntrada(@PathVariable Integer id) {
        try {
            tipoEntradaService.deleteTipoEntrada(id);
            return ResponseEntity.noContent().build();
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
