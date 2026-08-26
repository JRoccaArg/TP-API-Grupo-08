package com.uade.tpo.Zenoirprod.service;

import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;

public interface LocacionService {
    public Locacion getLocacionPorId(Integer id) throws LocacionInexsistenteException;
}
