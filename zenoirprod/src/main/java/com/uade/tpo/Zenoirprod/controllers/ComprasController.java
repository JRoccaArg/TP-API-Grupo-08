package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CompraResponse;
import com.uade.tpo.Zenoirprod.exceptions.CarritoAjenoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoNoModificableException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.DevolucionNoPermitidaException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.service.CompraService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

@RestController
@RequestMapping("compras")
public class ComprasController {

    @Autowired private CompraService service;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CompraResponse> crear(@AuthenticationPrincipal User usuario,
            @RequestBody CompraRequest request)
            throws CompraInvalidaException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException, VentaNoHabilitadaException, EventoNoDisponibleException,
            CarritoInexistenteException, CarritoAjenoException, CarritoNoModificableException {
        Compra compra = service.crearCompra(usuario, request);
        return ResponseEntity
                .created(URI.create("/compras/" + compra.getId()))
                .body(CompraResponse.fromEntity(compra));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or ((hasRole('USER') and @authorizationService.puedeAccederCompra(#id, authentication)))")
    public ResponseEntity<CompraResponse> getPorId(@PathVariable Integer id) {
        return service.getPorId(id)
                .map(CompraResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<CompraResponse>> getPorUsuario(@AuthenticationPrincipal User usuario,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        Page<CompraResponse> respuesta = service.getPorUsuario(usuario.getId(), PageableFactory.crear(page, size))
                .map(CompraResponse::fromEntity);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN') or ((hasRole('USER') and @authorizationService.puedeAccederCompra(#id, authentication)))")
    public ResponseEntity<CompraResponse> cancelar(@PathVariable Integer id)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException {
        return ResponseEntity.ok(CompraResponse.fromEntity(service.cancelar(id)));
    }
}
