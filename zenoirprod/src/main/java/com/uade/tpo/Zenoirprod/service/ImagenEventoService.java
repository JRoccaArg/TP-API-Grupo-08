package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenInvalidaException;


public interface ImagenEventoService {
    public Page<ImagenEvento> getImagenesPorEventoId(Integer eventoId, PageRequest pageRequest)
            throws EventoInexistenteException, Exception;
    public List<ImagenEvento> getImagenesPorEventoId(Integer eventoId)
            throws EventoInexistenteException, Exception;
    public Optional<ImagenEvento> getImagenPorEventoIdYImagenId(Integer eventoId, Integer imagenId) throws EventoInexistenteException, Exception;
    public ImagenEvento crearImagenEvento(MultipartFile archivo, String descripcion, Integer eventoId, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenInvalidaException, Exception;
    public void eliminarImagenEvento(Integer imagenId, Integer eventoId) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception;
    public ImagenEvento updateImagenEvento(Integer imagenId, Integer eventoId, MultipartFile archivo, String descripcion, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception;
}
