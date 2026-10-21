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

    Compra crearCompra(User usuario)
            throws CarritoActivoInexistenteException, CarritoVacioException, PagoNoIniciadoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            VentaNoHabilitadaException, EventoNoDisponibleException;

    Optional<Compra> getPorId(Integer id);

    Page<Compra> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    Compra reembolsarEvento(Integer id, Integer eventoId)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException;
}
