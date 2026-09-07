package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;

public interface ImagenLocacionService {
    public List<ImagenLocacion> getImagenesPorLocacionId(Integer locacionId)
            throws LocacionInexsistenteException;

    public Optional<ImagenLocacion> getImagenPorLocacionIdYImagenId(Integer locacionId, Integer imagenId)
            throws LocacionInexsistenteException;

    public ImagenLocacion crearImagenLocacion(MultipartFile archivo, String textoAlternativo,
            Integer locacionId, Integer orden)
            throws LocacionInexsistenteException, ImagenLocacionInvalidaException, Exception;

    public ImagenLocacion updateImagenLocacion(Integer imagenId, Integer locacionId,
            MultipartFile archivo, String textoAlternativo, Integer orden)
            throws LocacionInexsistenteException, ImagenLocacionInexistenteException,
            ImagenLocacionInvalidaException, Exception;

    public void eliminarImagenLocacion(Integer imagenId, Integer locacionId)
            throws LocacionInexsistenteException, ImagenLocacionInexistenteException;
}
