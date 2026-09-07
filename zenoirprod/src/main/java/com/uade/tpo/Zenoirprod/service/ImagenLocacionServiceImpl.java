package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.repository.ImagenLocacionRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;

@Service
public class ImagenLocacionServiceImpl implements ImagenLocacionService {

    @Autowired
    private ImagenLocacionRepository imagenLocacionRepository;

    @Autowired
    private LocationRepository locacionRepository;

    public List<ImagenLocacion> getImagenesPorLocacionId(Integer locacionId)
            throws LocacionInexsistenteException {
        if (locacionRepository.findById(locacionId).isEmpty()) {
            throw new LocacionInexsistenteException();
        }
        return imagenLocacionRepository.findByLocacionIdOrderByOrdenAsc(locacionId);
    }

    public Optional<ImagenLocacion> getImagenPorLocacionIdYImagenId(Integer locacionId, Integer imagenId)
            throws LocacionInexsistenteException {
        if (locacionRepository.findById(locacionId).isEmpty()) {
            throw new LocacionInexsistenteException();
        }
        return imagenLocacionRepository.findByLocacionIdOrderByOrdenAsc(locacionId).stream()
                .filter(imagen -> imagen.getId().equals(imagenId))
                .findFirst();
    }

    public ImagenLocacion crearImagenLocacion(MultipartFile archivo, String textoAlternativo,
            Integer locacionId, Integer orden)
            throws LocacionInexsistenteException, ImagenLocacionInvalidaException, Exception {
        if (locacionRepository.findById(locacionId).isEmpty()) {
            throw new LocacionInexsistenteException();
        }
        validarArchivo(archivo);

        ImagenLocacion imagenLocacion = new ImagenLocacion();
        imagenLocacion.setNombreArchivo(archivo.getOriginalFilename());
        imagenLocacion.setTipoContenido(archivo.getContentType());
        imagenLocacion.setTamanio(archivo.getSize());
        imagenLocacion.setDatos(archivo.getBytes());
        imagenLocacion.setTextoAlternativo(textoAlternativo);
        imagenLocacion.setLocacion(locacionRepository.findById(locacionId).get());
        imagenLocacion.setOrden(orden);
        imagenLocacion.setFechaCreacion(LocalDateTime.now());
        return imagenLocacionRepository.save(imagenLocacion);
    }

    public ImagenLocacion updateImagenLocacion(Integer imagenId, Integer locacionId,
            MultipartFile archivo, String textoAlternativo, Integer orden)
            throws LocacionInexsistenteException, ImagenLocacionInexistenteException,
            ImagenLocacionInvalidaException, Exception {
        if (locacionRepository.findById(locacionId).isEmpty()) {
            throw new LocacionInexsistenteException();
        }

        Optional<ImagenLocacion> imagenLocacionOptional = imagenLocacionRepository.findById(imagenId);
        if (imagenLocacionOptional.isEmpty()
                || imagenLocacionOptional.get().getLocacion().getId() != locacionId) {
            throw new ImagenLocacionInexistenteException();
        }

        ImagenLocacion imagenLocacion = imagenLocacionOptional.get();
        boolean huboCambios = false;

        if (archivo != null && !archivo.isEmpty()) {
            validarArchivo(archivo);
            imagenLocacion.setNombreArchivo(archivo.getOriginalFilename());
            imagenLocacion.setTipoContenido(archivo.getContentType());
            imagenLocacion.setTamanio(archivo.getSize());
            imagenLocacion.setDatos(archivo.getBytes());
            huboCambios = true;
        }
        if (textoAlternativo != null
                && !textoAlternativo.equals(imagenLocacion.getTextoAlternativo())) {
            imagenLocacion.setTextoAlternativo(textoAlternativo);
            huboCambios = true;
        }
        if (orden != null && !orden.equals(imagenLocacion.getOrden())) {
            imagenLocacion.setOrden(orden);
            huboCambios = true;
        }

        if (huboCambios) {
            return imagenLocacionRepository.save(imagenLocacion);
        }
        return imagenLocacion;
    }

    public void eliminarImagenLocacion(Integer imagenId, Integer locacionId)
            throws LocacionInexsistenteException, ImagenLocacionInexistenteException {
        if (locacionRepository.findById(locacionId).isEmpty()) {
            throw new LocacionInexsistenteException();
        }
        if (imagenLocacionRepository.findByLocacionIdOrderByOrdenAsc(locacionId).stream()
                .noneMatch(imagen -> imagen.getId().equals(imagenId))) {
            throw new ImagenLocacionInexistenteException();
        }
        imagenLocacionRepository.deleteById(imagenId);
    }

    private void validarArchivo(MultipartFile archivo) throws ImagenLocacionInvalidaException {
        if (archivo == null || archivo.isEmpty()
                || archivo.getContentType() == null
                || !archivo.getContentType().startsWith("image/")) {
            throw new ImagenLocacionInvalidaException();
        }
    }
}
