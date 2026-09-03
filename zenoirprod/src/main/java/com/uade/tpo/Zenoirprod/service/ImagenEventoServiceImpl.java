package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenEventoRepository;



@Service
public class ImagenEventoServiceImpl implements ImagenEventoService {
    @Autowired
    ImagenEventoRepository imagenEventoRepository;

    @Autowired
    EventosRepository eventosRepository;

    public List<ImagenEvento> getImagenesPorEventoId(Integer eventoId) throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        return imagenEventoRepository.findByEventoId(eventoId);
    }

    public Optional<ImagenEvento> getImagenPorEventoIdYImagenId(Integer eventoId, Integer imagenId) throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        Optional<ImagenEvento> imagen = imagenEventoRepository.findByEventoId(eventoId).stream().filter(img -> img.getId().equals(imagenId)).findFirst();
        if (imagen.isEmpty()) {
            return Optional.empty();
        }
        return imagen;
    }

    public ImagenEvento crearImagenEvento(String url, String descripcion, Integer eventoId, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        ImagenEvento imagenEvento = new ImagenEvento();
        imagenEvento.setUrl(url);
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
        if (imagenEventoRepository.findByEventoId(eventoId).stream().noneMatch(imagen -> imagen.getId().equals(imagenId))) {
            throw new ImagenEventoInexistenteException();
        }
        imagenEventoRepository.deleteById(imagenId);
                
    }

    public ImagenEvento updateImagenEvento(Integer imagenId, Integer eventoId, String url, String descripcion, TipoImagenEvento tipo, Integer orden) throws EventoInexistenteException, ImagenEventoInexistenteException, Exception {
        if (eventosRepository.findById(eventoId).isEmpty()) {
            throw new EventoInexistenteException();
        }
        Optional<ImagenEvento> imagenEventoOptional = imagenEventoRepository.findById(imagenId);
        if (imagenEventoOptional.isEmpty() || !imagenEventoOptional.get().getEvento().getId().equals(eventoId)) {
            throw new ImagenEventoInexistenteException();
        }
        ImagenEvento imagenEvento = imagenEventoOptional.get();
        boolean huboCambios = false;
        if (url != null && !url.equals(imagenEvento.getUrl())) {
            imagenEvento.setUrl(url);
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


