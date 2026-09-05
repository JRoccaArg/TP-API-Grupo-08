package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;
import com.uade.tpo.Zenoirprod.service.CompraService;

@RestController
@RequestMapping("compras")
public class ComprasController {

    @Autowired private CompraService service;

    @PostMapping
    public ResponseEntity<Compra> crear(@RequestBody CompraRequest request)
            throws CompraInvalidaException, UsuarioInexistenteException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException {
        Compra compra = service.crearCompra(request);
        return ResponseEntity.created(URI.create("/compras/" + compra.getId())).body(compra);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> getPorId(@PathVariable Integer id) {
        Optional<Compra> resultado = service.getPorId(id);
        return resultado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Compra>> getPorUsuario(@RequestParam Integer usuarioId) {
        return ResponseEntity.ok(service.getPorUsuario(usuarioId));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Compra> cancelar(@PathVariable Integer id)
            throws CompraInexistenteException, CompraNoCancelableException {
        return ResponseEntity.ok(service.cancelar(id));
    }
}
