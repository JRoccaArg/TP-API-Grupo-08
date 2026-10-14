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

    /**
     * Devuelve el carrito abierto del usuario (ACTIVO o EN_PAGO), o crea uno nuevo si no tiene o si se le vencio.
     * Un usuario tiene como maximo un carrito abierto: dos pedidos simultaneos no crean dos.
     */
    Carrito obtenerOCrearActivo(User usuario);

    Page<Carrito> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    // Todas las operaciones siguientes actuan sobre el carrito abierto del usuario (ACTIVO o EN_PAGO).
    // Agregar o subir la cantidad aparta las entradas en el acto (se descuentan del stock) y quitar, bajar la
    // cantidad, vaciar y abandonar las devuelven. Las entradas quedan apartadas hasta fechaVencimiento: el reloj de
    // armado arranca con la primera entrada y, al iniciar el pago, empieza uno nuevo (el reloj de pago).

    /** Agrega la entrada al carrito activo del usuario; si todavia no tiene uno, lo crea. */
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

    /** Abandona el carrito: devuelve las entradas apartadas y vacia sus items. */
    Carrito abandonar(Integer usuarioId) throws CarritoActivoInexistenteException;

    /**
     * Entrada a la pantalla de pago: pasa el carrito a EN_PAGO y arranca un reloj de pago nuevo, contado desde ese
     * momento. Las entradas ya estaban apartadas; solo se vuelve a validar que el evento y las ofertas sigan a la
     * venta. Si ya estaba EN_PAGO lo devuelve tal cual, sin reiniciar el reloj.
     */
    Carrito iniciarPago(Integer usuarioId)
            throws CarritoActivoInexistenteException, CarritoVacioException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException, VentaNoHabilitadaException;

    /**
     * Si el carrito sigue abierto pero ya vencio, devuelve sus entradas, vacia sus items y lo deja ABANDONADO.
     * Lo llama el job de limpieza, un carrito por vez.
     */
    void abandonarSiVencido(Integer carritoId);
}
