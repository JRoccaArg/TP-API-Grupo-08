package com.uade.tpo.Zenoirprod.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.PagoNoIniciadoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.DevolucionNoPermitidaException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;

public interface CompraService {

    /** Paga (simulado, sin pasarela) todos los items del carrito EN_PAGO del usuario. */
    Compra crearCompra(User usuario)
            throws CarritoActivoInexistenteException, CarritoVacioException, PagoNoIniciadoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            VentaNoHabilitadaException, EventoNoDisponibleException;

    Optional<Compra> getPorId(Integer id);

    Page<Compra> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    /**
     * Reembolsa las entradas emitidas de un evento (cancelado o reprogramado) dentro de una compra. Las usadas no se reembolsan.
     * La compra pasa a CANCELADA solo cuando todas sus entradas quedaron reembolsadas.
     */
    Compra reembolsarEvento(Integer id, Integer eventoId)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException;
}
