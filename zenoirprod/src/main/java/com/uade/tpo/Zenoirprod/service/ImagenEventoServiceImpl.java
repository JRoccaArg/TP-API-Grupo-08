package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenEventoRepository;
import com.uade.tpo.Zenoirprod.exceptions.ImagenInvalidaException;


@Service
public class ImagenEventoServiceImpl implements ImagenEventoService {
    @Autowired
    ImagenEventoRepository imagenEventoRepository;

    @Autowired
    EventosRepository eventosRepository;

    public Page<ImagenEvento> getImagenesPorEventoId(Integer eventoId, PageRequest pageRequest)
            throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        return imagenEventoRepository.findByEventoIdOrderByOrdenAsc(eventoId, pageRequest);
    }

    public List<ImagenEvento> getImagenesPorEventoId(Integer eventoId) throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        return imagenEventoRepository.findByEventoIdOrderByOrdenAsc(eventoId);
    }

    public Optional<ImagenEvento> getImagenPorEventoIdYImagenId(Integer eventoId, Integer imagenId) throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        Optional<ImagenEvento> imagen = imagenEventoRepository.findByEventoIdOrderByOrdenAsc(eventoId).stream().filter(img -> img.getId().equals(imagenId)).findFirst();
        if (imagen.isEmpty()) {
            return Optional.empty();
        }
        return imagen;
    }

    public ImagenEvento crearImagenEvento(MultipartFile archivo, String descripcion, Integer eventoId, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenInvalidaException, Exception {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }

         // Validaciones respecto al archivo
        if (archivo == null || archivo.isEmpty()) {
            throw new ImagenInvalidaException();
        }

        if (archivo.getContentType() == null || !archivo.getContentType().startsWith("image/")) {
            throw new ImagenInvalidaException();
        }

        if (tipo == null) {
            throw new ImagenInvalidaException();
        }

        ImagenEvento imagenEvento = new ImagenEvento();
        imagenEvento.setNombreArchivo(archivo.getOriginalFilename());
        imagenEvento.setTipoContenido(archivo.getContentType());
        imagenEvento.setTamanio(archivo.getSize());
        imagenEvento.setDatos(archivo.getBytes());

        imagenEvento.setDescripcion(descripcion);
        imagenEvento.setEvento(eventosRepository.findById(eventoId).get());
        imagenEvento.setTipoImagenEvento(tipo);
        imagenEvento.setOrden(orden);
        return imagenEventoRepository.save(imagenEvento);
    }

    public void eliminarImagenEvento(Integer imagenId, Integer eventoId) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        if (imagenEventoRepository.findByEventoIdOrderByOrdenAsc(eventoId).stream().noneMatch(imagen -> imagen.getId().equals(imagenId))) {
            throw new ImagenEventoInexistenteException();
        }
        imagenEventoRepository.deleteById(imagenId);
                
    }

    public ImagenEvento updateImagenEvento(Integer imagenId, Integer eventoId, MultipartFile archivo, String descripcion, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        Optional<ImagenEvento> imagenEventoOptional = imagenEventoRepository.findById(imagenId);
        if (imagenEventoOptional.isEmpty() || !imagenEventoOptional.get().getEvento().getId().equals(eventoId)) {
            throw new ImagenEventoInexistenteException();
        }
        ImagenEvento imagenEvento = imagenEventoOptional.get();
        boolean huboCambios = false;

        if (archivo != null && !archivo.isEmpty()) {
            if (archivo.getContentType() == null ||
                !archivo.getContentType().startsWith("image/")) {
                throw new ImagenInvalidaException();
            }

            imagenEvento.setNombreArchivo(archivo.getOriginalFilename());
            imagenEvento.setTipoContenido(archivo.getContentType());
            imagenEvento.setTamanio(archivo.getSize());
            imagenEvento.setDatos(archivo.getBytes());
            huboCambios = true;
        }

        if (descripcion != null && !descripcion.equals(imagenEvento.getDescripcion())) {
            imagenEvento.setDescripcion(descripcion);
            huboCambios = true;
        }
        if (tipo != null && !tipo.equals(imagenEvento.getTipoImagenEvento())) {
            imagenEvento.setTipoImagenEvento(tipo);
            huboCambios = true;
        }
        if (orden != null && !orden.equals(imagenEvento.getOrden())) {
            imagenEvento.setOrden(orden);
            huboCambios = true;
        }
        if (huboCambios) {
            return imagenEventoRepository.save(imagenEvento);
        }
        return imagenEvento;
    }
}


