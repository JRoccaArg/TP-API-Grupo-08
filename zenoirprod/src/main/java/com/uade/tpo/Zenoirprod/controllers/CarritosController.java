package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.ActualizarCantidadRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CarritoResponse;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.service.CarritoService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

// Todo actúa sobre el carrito abierto del usuario del token
@RestController
@RequestMapping("carritos")
public class CarritosController {

    @Autowired private CarritoService service;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> obtenerOCrearActivo(@AuthenticationPrincipal User usuario) {
        Carrito carrito = service.obtenerOCrearActivo(usuario);
        return ResponseEntity
                .created(URI.create("/carritos/activo"))
                .body(CarritoResponse.fromEntity(carrito));
    }

    @GetMapping("/activo")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> getActivo(@AuthenticationPrincipal User usuario) {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.obtenerOCrearActivo(usuario)));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<CarritoResponse>> getMisCarritos(@AuthenticationPrincipal User usuario,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        Page<CarritoResponse> respuesta = service.getPorUsuario(usuario.getId(), PageableFactory.crear(page, size))
                .map(CarritoResponse::fromEntity);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/activo/items")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> agregarItem(@AuthenticationPrincipal User usuario,
            @RequestBody ItemCarritoRequest request)
            throws ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.agregarItem(usuario, request)));
    }

    @PatchMapping("/activo/items/{itemId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> actualizarCantidad(@AuthenticationPrincipal User usuario,
            @PathVariable Integer itemId, @RequestBody ActualizarCantidadRequest request)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(
                service.actualizarCantidad(usuario.getId(), itemId, request.getCantidad())));
    }

    @DeleteMapping("/activo/items/{itemId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> quitarItem(@AuthenticationPrincipal User usuario,
            @PathVariable Integer itemId)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.quitarItem(usuario.getId(), itemId)));
    }

    @PostMapping("/activo/vaciar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> vaciar(@AuthenticationPrincipal User usuario)
            throws CarritoActivoInexistenteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.vaciar(usuario.getId())));
    }

    // Al abrir la pantalla de pago (el botón de pagar de esa pantalla es POST /compras)
    @PostMapping("/activo/iniciar-pago")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> iniciarPago(@AuthenticationPrincipal User usuario)
            throws CarritoActivoInexistenteException, CarritoVacioException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException, VentaNoHabilitadaException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.iniciarPago(usuario.getId())));
    }

    @PostMapping("/activo/abandonar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CarritoResponse> abandonar(@AuthenticationPrincipal User usuario)
            throws CarritoActivoInexistenteException {
        return ResponseEntity.ok(CarritoResponse.fromEntity(service.abandonar(usuario.getId())));
    }
}
