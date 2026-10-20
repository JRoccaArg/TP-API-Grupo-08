package com.uade.tpo.Zenoirprod.service;

import com.uade.tpo.Zenoirprod.entity.dto.EstadisticasEventoResponse;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;

public interface EstadisticasService {

    EstadisticasEventoResponse getEstadisticas(Integer eventoId) throws EventoInexistenteException;
}
