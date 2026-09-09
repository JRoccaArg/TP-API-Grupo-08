package com.uade.tpo.Zenoirprod.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInvalidoException;

public interface TipoEntradaService {
    public Page<TipoEntrada> getTiposEntrada(PageRequest pageRequest);

    public TipoEntrada getTipoEntradaPorId(Integer id) throws TipoEntradaInexistenteException;

    public TipoEntrada crearTipoEntrada(String nombre, String descripcionBase, Boolean activo)
            throws TipoEntradaInvalidoException, TipoEntradaDuplicadoException;

    public TipoEntrada updateTipoEntrada(Integer id, String nombre, String descripcionBase, Boolean activo)
            throws TipoEntradaInexistenteException, TipoEntradaInvalidoException, TipoEntradaDuplicadoException;

    public void deleteTipoEntrada(Integer id)
            throws TipoEntradaInexistenteException, TipoEntradaEnUsoException;
}
