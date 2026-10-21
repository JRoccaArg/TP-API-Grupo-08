package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;

import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.dto.ImagenEventoRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ImagenEventoInexistenteException;
import com.uade.tpo.Zenoirprod.service.EventosService;
import com.uade.tpo.Zenoirprod.service.ImagenEventoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.uade.tpo.Zenoirprod.util.PageableFactory;
import com.uade.tpo.Zenoirprod.util.Permisos;





@RestController
@RequestMapping
public class ImagenEventoController {
    @Autowired
    private ImagenEventoService imagenEventoService;

    @Autowired
    private EventosService eventosService;

    @GetMapping("eventos/{eventoId}/imagenes")
    public ResponseEntity<Page<ImagenEvento>> getImagenesPorEventoId(@PathVariable Integer eventoId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            Authentication authentication) throws Exception {
        // Los borradores solo los lista el admin (el archivo de cada foto queda abierto porque <img> no manda la sesión)
        if (!Permisos.puedeVer(eventosService.getEventoPorId(eventoId).orElseThrow(EventoInexistenteException::new), authentication)) {
            throw new EventoInexistenteException();
        }
        Page<ImagenEvento> imagenes = imagenEventoService.getImagenesPorEventoId(
                eventoId, PageableFactory.crear(page, size));
        return ResponseEntity.ok(imagenes);
    }

    @GetMapping("eventos/{eventoId}/imagenes/{imagenId}")
    public ResponseEntity<ImagenEvento> getImagenPorEventoIdYImagenId(@PathVariable Integer eventoId, @PathVariable Integer imagenId)
            throws Exception {
        ImagenEvento imagen = imagenEventoService.getImagenPorEventoIdYImagenId(eventoId, imagenId)
                .orElseThrow(ImagenEventoInexistenteException::new);
        return ResponseEntity.ok(imagen);
    }

    @GetMapping("eventos/{eventoId}/imagenes/{imagenId}/archivo")
    public ResponseEntity<byte[]> getArchivoImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId)
            throws Exception {
        ImagenEvento imagen = imagenEventoService.getImagenPorEventoIdYImagenId(eventoId, imagenId)
                .orElseThrow(ImagenEventoInexistenteException::new);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagen.getNombreArchivo() + "\"")
                .body(imagen.getDatos());
    }

    // Recibe un formulario multipart y no un JSON (tenerlo en cuenta al probar con Insomnia)
    @PostMapping(value = "eventos/{eventoId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenEvento> postImagen(@PathVariable Integer eventoId, @ModelAttribute ImagenEventoRequest imagenEventoRequest)
            throws Exception {
        ImagenEvento resultado = imagenEventoService.crearImagenEvento(imagenEventoRequest.getArchivo(), imagenEventoRequest.getDescripcion(), eventoId, imagenEventoRequest.getTipoImagenEvento(), imagenEventoRequest.getOrden());
        return ResponseEntity.created(URI.create("/eventos/" + eventoId + "/imagenes/" + resultado.getId())).body(resultado);
    }

    @PatchMapping(value="eventos/{eventoId}/imagenes/{imagenId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenEvento> patchImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId, @ModelAttribute ImagenEventoRequest ImagenEventoRequest)
            throws Exception {
        return ResponseEntity.ok(imagenEventoService.updateImagenEvento(imagenId, eventoId, ImagenEventoRequest.getArchivo(), ImagenEventoRequest.getDescripcion(), ImagenEventoRequest.getTipoImagenEvento(), ImagenEventoRequest.getOrden()));
    }

    @DeleteMapping("eventos/{eventoId}/imagenes/{imagenId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteImagen(@PathVariable Integer eventoId, @PathVariable Integer imagenId)
            throws Exception {
        imagenEventoService.eliminarImagenEvento(imagenId, eventoId);
        return ResponseEntity.noContent().build();
    }

}
