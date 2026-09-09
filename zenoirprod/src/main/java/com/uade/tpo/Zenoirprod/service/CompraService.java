package com.uade.tpo.Zenoirprod.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoAjenoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoNoModificableException;
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

public interface CompraService {

    Compra crearCompra(CompraRequest request)
            throws CompraInvalidaException, UsuarioInexistenteException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException, VentaNoHabilitadaException, EventoNoDisponibleException,
            CarritoInexistenteException, CarritoAjenoException, CarritoNoModificableException;

    Optional<Compra> getPorId(Integer id);

    Page<Compra> getPorUsuario(Integer usuarioId, PageRequest pageRequest);

    Compra cancelar(Integer id)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException;
}
