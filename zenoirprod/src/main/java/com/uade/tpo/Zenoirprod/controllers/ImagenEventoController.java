package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.dto.ImagenEventoRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenInvalidaException;
import com.uade.tpo.Zenoirprod.service.ImagenEventoService;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;





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

    @GetMapping("eventos/{eventoId}/imagenes/{imagenId}/archivo")
    public ResponseEntity<byte[]> getArchivoImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId) {
        try {
            Optional<ImagenEvento> imagen = imagenEventoService.getImagenPorEventoIdYImagenId(eventoId, imagenId);
            if (imagen.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imagen.get().getTipoContenido()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagen.get().getNombreArchivo() + "\"")
                    .body(imagen.get().getDatos());
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Value es la ruta del endpoint y consumes es el tipo de contenido que se espera recibir en la solicitud
    // Osea, espera recibir un formulario Multipart en lugar de un JSON (esto contemplarlo al usar insomnia)
    @PostMapping(value = "eventos/{eventoId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenEvento> postImagen(@PathVariable Integer eventoId, @ModelAttribute ImagenEventoRequest imagenEventoRequest) {
        try {
            ImagenEvento resultado = imagenEventoService.crearImagenEvento(imagenEventoRequest.getArchivo(), imagenEventoRequest.getDescripcion(), eventoId, imagenEventoRequest.getTipoImagenEvento(), imagenEventoRequest.getOrden());
            return ResponseEntity.created(URI.create("/eventos/" + eventoId + "/imagenes/" + resultado.getId())).body(resultado);
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenInvalidaException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PatchMapping(value="eventos/{eventoId}/imagenes/{imagenId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenEvento> patchImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId, @ModelAttribute ImagenEventoRequest ImagenEventoRequest) {
        try {
            return ResponseEntity.ok(imagenEventoService.updateImagenEvento(imagenId, eventoId, ImagenEventoRequest.getArchivo(), ImagenEventoRequest.getDescripcion(), ImagenEventoRequest.getTipoImagenEvento(), ImagenEventoRequest.getOrden()));
        }
        catch (EventoInexistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenEventoInexistenteException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (ImagenInvalidaException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("eventos/{eventoId}/imagenes/{imagenId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId) {
        try {
            imagenEventoService.eliminarImagenEvento(imagenId, eventoId);
            return ResponseEntity.noContent().build();
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
