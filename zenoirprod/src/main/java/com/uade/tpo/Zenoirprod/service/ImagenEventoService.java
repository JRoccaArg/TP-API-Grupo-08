package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;

public interface ImagenEventoService {
    public List<ImagenEvento> getImagenesPorEventoId(Integer eventoId) throws EventoInexistenteException, Exception;
    public Optional<ImagenEvento> getImagenPorEventoIdYImagenId(Integer eventoId, Integer imagenId) throws EventoInexistenteException, Exception;
    public ImagenEvento crearImagenEvento(String url, String descripcion, Integer eventoId, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, Exception;
    public void eliminarImagenEvento(Integer imagenId, Integer eventoId) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception;
    public ImagenEvento updateImagenEvento(Integer imagenId, Integer eventoId, String url, String descripcion, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception;
}
