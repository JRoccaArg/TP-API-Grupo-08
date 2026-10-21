package com.uade.tpo.Zenoirprod.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;

public interface CarritoService {

    Carrito obtenerOCrearActivo(User usuario);

    Page<Carrito> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    // Reglas de la reserva (relojes, bloqueos): ver el comentario de CarritoServiceImpl

    Carrito agregarItem(User usuario, ItemCarritoRequest request)
            throws ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException;

    Carrito actualizarCantidad(Integer usuarioId, Integer itemId, Integer cantidad)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException;

    Carrito quitarItem(Integer usuarioId, Integer itemId)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException;

    Carrito vaciar(Integer usuarioId) throws CarritoActivoInexistenteException;

    Carrito abandonar(Integer usuarioId) throws CarritoActivoInexistenteException;

    /** Pasa a EN_PAGO y arranca el reloj de pago; si ya estaba EN_PAGO lo devuelve igual, sin reiniciarlo. */
    Carrito iniciarPago(Integer usuarioId)
            throws CarritoActivoInexistenteException, CarritoVacioException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException, VentaNoHabilitadaException;

    void abandonarSiVencido(Integer carritoId);
}
