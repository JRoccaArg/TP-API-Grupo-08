package com.uade.tpo.Zenoirprod.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;

public interface CarritoService {

    /** Devuelve el carrito ACTIVO del usuario, o crea uno nuevo si no tiene. */
    Carrito obtenerOCrearActivo(User usuario);

    /** Devuelve el carrito ACTIVO del usuario. */
    Carrito getActivo(Integer usuarioId) throws CarritoActivoInexistenteException;

    Page<Carrito> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    // Todas las operaciones siguientes actuan sobre el carrito ACTIVO del usuario.

    /** Agrega la entrada al carrito activo del usuario; si todavia no tiene uno, lo crea. */
    Carrito agregarItem(User usuario, ItemCarritoRequest request)
            throws ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, StockInsuficienteException;

    Carrito actualizarCantidad(Integer usuarioId, Integer itemId, Integer cantidad)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, StockInsuficienteException;

    Carrito quitarItem(Integer usuarioId, Integer itemId)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException;

    Carrito vaciar(Integer usuarioId) throws CarritoActivoInexistenteException;

    Carrito abandonar(Integer usuarioId) throws CarritoActivoInexistenteException;
}
