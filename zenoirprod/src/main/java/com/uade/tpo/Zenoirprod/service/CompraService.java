package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;

public interface CompraService {

    Compra crearCompra(CompraRequest request) throws CompraInvalidaException;

    Optional<Compra> getPorId(Integer id);

    List<Compra> getPorUsuario(Integer usuarioId);

    Compra cancelar(Integer id) throws CompraInexistenteException, CompraNoCancelableException;
}
