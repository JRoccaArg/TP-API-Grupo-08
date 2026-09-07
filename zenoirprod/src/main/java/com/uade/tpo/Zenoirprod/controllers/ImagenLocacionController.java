package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;
import com.uade.tpo.Zenoirprod.entity.dto.ImagenLocacionRequest;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenLocacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.service.ImagenLocacionService;

@RestController
@RequestMapping
public class ImagenLocacionController {

    @Autowired
    private ImagenLocacionService imagenLocacionService;

    @GetMapping("locaciones/{locacionId}/imagenes")
    public ResponseEntity<List<ImagenLocacion>> getImagenesPorLocacionId(@PathVariable Integer locacionId) {
        try {
            List<ImagenLocacion> imagenes = imagenLocacionService.getImagenesPorLocacionId(locacionId);
            if (imagenes.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(imagenes);
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("locaciones/{locacionId}/imagenes/{imagenId}")
    public ResponseEntity<ImagenLocacion> getImagenPorLocacionIdYImagenId(
            @PathVariable Integer locacionId, @PathVariable Integer imagenId) {
        try {
            Optional<ImagenLocacion> imagen = imagenLocacionService
                    .getImagenPorLocacionIdYImagenId(locacionId, imagenId);
            if (imagen.isPresent()) {
                return ResponseEntity.ok(imagen.get());
            }
            return ResponseEntity.badRequest().build();
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("locaciones/{locacionId}/imagenes/{imagenId}/archivo")
    public ResponseEntity<byte[]> getArchivoImagen(@PathVariable Integer locacionId,
            @PathVariable Integer imagenId) {
        try {
            Optional<ImagenLocacion> imagen = imagenLocacionService
                    .getImagenPorLocacionIdYImagenId(locacionId, imagenId);
            if (imagen.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imagen.get().getTipoContenido()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + imagen.get().getNombreArchivo() + "\"")
                    .body(imagen.get().getDatos());
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping(value = "locaciones/{locacionId}/imagenes",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenLocacion> postImagen(@PathVariable Integer locacionId,
            @ModelAttribute ImagenLocacionRequest imagenLocacionRequest) {
        try {
            ImagenLocacion resultado = imagenLocacionService.crearImagenLocacion(
                    imagenLocacionRequest.getArchivo(),
                    imagenLocacionRequest.getTextoAlternativo(),
                    locacionId,
                    imagenLocacionRequest.getOrden());
            return ResponseEntity.created(URI.create(
                    "/locaciones/" + locacionId + "/imagenes/" + resultado.getId())).body(resultado);
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenLocacionInvalidaException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping(value = "locaciones/{locacionId}/imagenes/{imagenId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenLocacion> patchImagen(@PathVariable Integer locacionId,
            @PathVariable Integer imagenId,
            @ModelAttribute ImagenLocacionRequest imagenLocacionRequest) {
        try {
            return ResponseEntity.ok(imagenLocacionService.updateImagenLocacion(
                    imagenId,
                    locacionId,
                    imagenLocacionRequest.getArchivo(),
                    imagenLocacionRequest.getTextoAlternativo(),
                    imagenLocacionRequest.getOrden()));
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenLocacionInexistenteException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (ImagenLocacionInvalidaException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("locaciones/{locacionId}/imagenes/{imagenId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteImagen(@PathVariable Integer locacionId,
            @PathVariable Integer imagenId) {
        try {
            imagenLocacionService.eliminarImagenLocacion(imagenId, locacionId);
            return ResponseEntity.noContent().build();
        }
        catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
        catch (ImagenLocacionInexistenteException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
