package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.dto.CarritoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoNoModificableException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;

public interface CarritoService {

    /** Devuelve el carrito ACTIVO del usuario, o crea uno nuevo si no tiene. */
    Carrito obtenerOCrearActivo(CarritoRequest request)
            throws CarritoInvalidoException, UsuarioInexistenteException;

    Optional<Carrito> getPorId(Integer id);

    List<Carrito> getPorUsuario(Integer usuarioId);

    Carrito agregarItem(Integer carritoId, ItemCarritoRequest request)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInvalidoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException;

    Carrito actualizarCantidad(Integer carritoId, Integer itemId, Integer cantidad)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, StockInsuficienteException;

    Carrito quitarItem(Integer carritoId, Integer itemId)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException;

    Carrito vaciar(Integer carritoId) throws CarritoInexistenteException, CarritoNoModificableException;

    Carrito abandonar(Integer carritoId) throws CarritoInexistenteException, CarritoNoModificableException;
}
