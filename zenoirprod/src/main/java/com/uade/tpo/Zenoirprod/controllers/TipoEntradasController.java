package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.uade.tpo.Zenoirprod.entity.dto.TipoEntradaResponse;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.service.TipoEntradaService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

@RestController
@RequestMapping("tiposEntrada")
public class TipoEntradasController {

    @Autowired
    private TipoEntradaService tipoEntradaService;

    @GetMapping
    public ResponseEntity<Page<TipoEntradaResponse>> getTiposEntrada(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        Page<TipoEntrada> pagina = tipoEntradaService.getTiposEntrada(PageableFactory.crear(page, size));
        return ResponseEntity.ok(pagina.map(TipoEntradaResponse::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoEntradaResponse> getTipoEntradaPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(TipoEntradaResponse.fromEntity(tipoEntradaService.getTipoEntradaPorId(id)));
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TipoEntradaResponse> crearTipoEntrada(@RequestBody TipoEntradaRequest tipoEntradaRequest)
            throws TipoEntradaInvalidoException, TipoEntradaDuplicadoException {
        TipoEntrada creado = tipoEntradaService.crearTipoEntrada(
                tipoEntradaRequest.getNombre(),
                tipoEntradaRequest.getDescripcionBase(),
                tipoEntradaRequest.getActivo());
        return ResponseEntity.ok(TipoEntradaResponse.fromEntity(creado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TipoEntradaResponse> updateTipoEntrada(@PathVariable Integer id,
            @RequestBody TipoEntradaRequest tipoEntradaRequest)
            throws TipoEntradaInvalidoException, TipoEntradaDuplicadoException {
        try {
            TipoEntrada actualizado = tipoEntradaService.updateTipoEntrada(
                    id,
                    tipoEntradaRequest.getNombre(),
                    tipoEntradaRequest.getDescripcionBase(),
                    tipoEntradaRequest.getActivo());
            return ResponseEntity.ok(TipoEntradaResponse.fromEntity(actualizado));
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTipoEntrada(@PathVariable Integer id)
            throws TipoEntradaEnUsoException {
        try {
            tipoEntradaService.deleteTipoEntrada(id);
            return ResponseEntity.noContent().build();
        } catch (TipoEntradaInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
