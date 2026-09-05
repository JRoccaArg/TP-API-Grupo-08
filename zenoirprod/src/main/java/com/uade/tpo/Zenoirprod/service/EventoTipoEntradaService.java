package com.uade.tpo.Zenoirprod.service;

import java.math.BigDecimal;
import java.util.List;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;

public interface EventoTipoEntradaService {

    public EventoTipoEntrada getPorId(Integer id) throws EventoTipoEntradaInexistenteException;

    public List<EventoTipoEntrada> getPorEvento(Integer eventoId) throws EventoInexistenteException;

    public EventoTipoEntrada crear(EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInvalidoException, EventoTipoEntradaDuplicadoException,
            EventoInexistenteException, TipoEntradaInexistenteException;

    public EventoTipoEntrada actualizar(Integer id, EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException;

    public void eliminar(Integer id) throws EventoTipoEntradaInexistenteException;

    public BigDecimal getPrecioFinal(Integer id) throws EventoTipoEntradaInexistenteException;

    public boolean hayDisponibilidad(Integer id, Integer cantidad) throws EventoTipoEntradaInexistenteException;

    public void descontarStock(Integer id, Integer cantidad)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException, StockInsuficienteException;

    public void reponerStock(Integer id, Integer cantidad)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException;
}
