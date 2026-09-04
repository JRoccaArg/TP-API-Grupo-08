package com.uade.tpo.Zenoirprod.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.exceptions.LocacionEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;

public interface LocacionService {
    public Page<Locacion> getLocaciones(PageRequest pageRequest);

    public Locacion getLocacionPorId(Integer id) throws LocacionInexsistenteException;

    public Locacion crearLocacion(String nombre, String direccion, Integer capacidadMax);

    public Locacion updateLocacion(Integer id, String nombre, String direccion, Integer capacidadMax)
            throws LocacionInexsistenteException;

    public void deleteLocacion(Integer id) throws LocacionInexsistenteException, LocacionEnUsoException;
}
