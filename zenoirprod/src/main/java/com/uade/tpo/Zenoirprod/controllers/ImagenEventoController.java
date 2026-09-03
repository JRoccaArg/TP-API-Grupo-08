package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.dto.ImagenEventoRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.service.ImagenEventoService;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;





@RestController
@RequestMapping
public class ImagenEventoController {
    @Autowired
    private ImagenEventoService imagenEventoService;

    
    @GetMapping("eventos/{eventoId}/imagenes")
    public ResponseEntity<List<ImagenEvento>> getImagenesPorEventoId(@PathVariable Integer eventoId) {
        try {
            List<ImagenEvento> imagenes = imagenEventoService.getImagenesPorEventoId(eventoId);
            if (imagenes.isEmpty()) {
                return ResponseEntity.noContent().build();
            } 
            else {
                return ResponseEntity.ok(imagenes);
            }
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }

    }
    
    @GetMapping("eventos/{eventoId}/imagenes/{imagenId}")
    public ResponseEntity<ImagenEvento> getImagenPorEventoIdYImagenId(@PathVariable Integer eventoId, @PathVariable Integer imagenId) {
        try {
            Optional<ImagenEvento> imagen = imagenEventoService.getImagenPorEventoIdYImagenId(eventoId, imagenId);
            if (imagen.isPresent()) {
                return ResponseEntity.ok(imagen.get());
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("eventos/{eventoId}/imagenes")
    public ResponseEntity<ImagenEvento> postImagen(@PathVariable Integer eventoId, @RequestBody ImagenEventoRequest ImagenEventoRequest) {
        try {
            return ResponseEntity.ok(imagenEventoService.crearImagenEvento(ImagenEventoRequest.getUrl(), ImagenEventoRequest.getDescripcion(), eventoId, ImagenEventoRequest.getTipoImagenEvento(), ImagenEventoRequest.getOrden()));
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenEventoInexistenteException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PatchMapping("eventos/{eventoId}/imagenes/{imagenId}")
    public ResponseEntity<ImagenEvento> patchImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId, @RequestBody ImagenEventoRequest ImagenEventoRequest) {
        try {
            return ResponseEntity.ok(imagenEventoService.updateImagenEvento(imagenId, eventoId, ImagenEventoRequest.getUrl(), ImagenEventoRequest.getDescripcion(), ImagenEventoRequest.getTipoImagenEvento(), ImagenEventoRequest.getOrden()));
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenEventoInexistenteException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
}
