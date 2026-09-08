package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CompraResponse;
import com.uade.tpo.Zenoirprod.exceptions.CarritoAjenoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.DevolucionNoPermitidaException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.service.CompraService;

@RestController
@RequestMapping("compras")
public class ComprasController {

    @Autowired private CompraService service;

    @PostMapping
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeUsarUsuario(#request.usuarioId, authentication)")
    public ResponseEntity<CompraResponse> crear(@RequestBody CompraRequest request)
            throws CompraInvalidaException, UsuarioInexistenteException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException, VentaNoHabilitadaException, EventoNoDisponibleException,
            CarritoInexistenteException, CarritoAjenoException {
        Compra compra = service.crearCompra(request);
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
    @PreAuthorize("hasRole('ADMIN') or ((hasRole('USER') and @authorizationService.puedeUsarUsuario(#usuarioId, authentication)))")
    public ResponseEntity<List<CompraResponse>> getPorUsuario(@RequestParam Integer usuarioId) {
        List<CompraResponse> respuesta = service.getPorUsuario(usuarioId)
                .stream()
                .map(CompraResponse::fromEntity)
                .toList();
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
