package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.dto.ActualizarCantidadRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CarritoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CarritoResponse;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoNoModificableException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;
import com.uade.tpo.Zenoirprod.service.CarritoService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

@RestController
@RequestMapping("carritos")
public class CarritosController {

    @Autowired private CarritoService service;

    @PostMapping
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeUsarUsuario(#request.usuarioId, authentication)")
    public ResponseEntity<CarritoResponse> obtenerOCrearActivo(@RequestBody CarritoRequest request)
            throws CarritoInvalidoException, UsuarioInexistenteException {
        Carrito carrito = service.obtenerOCrearActivo(request);
        return ResponseEntity
                .created(URI.create("/carritos/" + carrito.getId()))
                .body(CarritoResponse.fromEntity(carrito));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> getPorId(@PathVariable Integer id) {
        return service.getPorId(id)
                .map(CarritoResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeUsarUsuario(#usuarioId, authentication)")
    public ResponseEntity<Page<CarritoResponse>> getPorUsuario(@RequestParam Integer usuarioId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        Page<CarritoResponse> respuesta = service.getPorUsuario(usuarioId, PageableFactory.crear(page, size))
                .map(CarritoResponse::fromEntity);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> agregarItem(@PathVariable Integer id, @RequestBody ItemCarritoRequest request)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInvalidoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.agregarItem(id, request)));
    }

    @PatchMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> actualizarCantidad(@PathVariable Integer id, @PathVariable Integer itemId,
            @RequestBody ActualizarCantidadRequest request)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, StockInsuficienteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.actualizarCantidad(id, itemId, request.getCantidad())));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> quitarItem(@PathVariable Integer id, @PathVariable Integer itemId)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.quitarItem(id, itemId)));
    }

    @PostMapping("/{id}/vaciar")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> vaciar(@PathVariable Integer id)
            throws CarritoInexistenteException, CarritoNoModificableException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.vaciar(id)));
    }

    @PostMapping("/{id}/abandonar")
    @PreAuthorize("hasRole('USER') and @authorizationService.puedeAccederCarrito(#id, authentication)")
    public ResponseEntity<CarritoResponse> abandonar(@PathVariable Integer id)
            throws CarritoInexistenteException, CarritoNoModificableException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.abandonar(id)));
    }
}
