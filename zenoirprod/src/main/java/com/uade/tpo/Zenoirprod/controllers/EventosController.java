package com.uade.tpo.Zenoirprod.controllers;

import java.net.URI;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EstadisticasEventoResponse;
import com.uade.tpo.Zenoirprod.entity.dto.EventoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.EventoResponse;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.service.EstadisticasService;
import com.uade.tpo.Zenoirprod.service.EventosService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;
import com.uade.tpo.Zenoirprod.util.Permisos;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("eventos")
public class EventosController {
    @Autowired
    private EventosService eventosService;

    @Autowired
    private EstadisticasService estadisticasService;

    // Como viene el evento (ventas, recaudado, compras e ingresos): lo usa el resumen del evento en el panel del admin.
    @GetMapping("/{id}/estadisticas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EstadisticasEventoResponse> getEstadisticas(@PathVariable Integer id)
            throws EventoInexistenteException {
        return ResponseEntity.ok(estadisticasService.getEstadisticas(id));
    }

    @GetMapping
    public ResponseEntity<Page<EventoResponse>> getEventos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Integer categoriaId,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(defaultValue = "false") boolean catalogo,
            @RequestParam(defaultValue = "false") boolean proximo,
            @RequestParam(defaultValue = "lejanos") String orden,
            @RequestParam(required = false) String estadoEvento,
            Authentication authentication
    ) throws PaginacionInvalidaException, EventoInvalidoException {
        if (estadoEvento != null || orden.equals("menor-precio") || orden.equals("mayor-precio") || orden.equals("proximos")) {
            Page<Evento> pagina = eventosService.getCatalogo(PageableFactory.crear(page, size), nombre, categoriaId,
                    precioMin, precioMax, estadoEvento == null ? "todos" : estadoEvento,
                    orden.equals("antiguos") ? "proximos" : orden);
            return ResponseEntity.ok(pagina.map(EventoResponse::fromEntity));
        }
        // Solo afecta al catalogo: "lejanos" = la fecha mas futura primero; "antiguos" = la mas antigua primero.
        if (!orden.equals("lejanos") && !orden.equals("antiguos")) {
            throw new PaginacionInvalidaException("El orden debe ser 'lejanos' o 'antiguos'.");
        }
        // Los borradores no estan publicados: solo el administrador los ve (sin sesion de admin siempre se pide el catalogo).
        boolean soloPublicados = catalogo || !Permisos.esAdmin(authentication);
        Page<Evento> pagina = eventosService.getEventos(PageableFactory.crear(page, size),
                nombre, categoriaId, precioMin, precioMax, soloPublicados, proximo, orden.equals("antiguos"));
        return ResponseEntity.ok(pagina.map(EventoResponse::fromEntity));
    }

    @GetMapping("/rango-precios")
    public ResponseEntity<java.util.Map<String, BigDecimal>> getRangoPrecios() {
        return ResponseEntity.ok(java.util.Map.of("maximo", eventosService.precioMaximoCatalogo()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponse> getEventoPorId(@PathVariable Integer id, Authentication authentication)
            throws EventoInexistenteException {
        return eventosService.getEventoPorId(id)
                .filter(evento -> Permisos.puedeVer(evento, authentication))
                .map(EventoResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseThrow(EventoInexistenteException::new);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> patchEvento(@PathVariable Integer id, @RequestBody EventoRequest eventoRequest)
            throws EventoInexistenteException, LocacionInexsistenteException, TituloEventoEnUsoException,
            FechaEventoInvalidaException, EventoInvalidoException, CategoryInexistenteException {
        Evento actualizado = eventosService.updateEvento(id, eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                eventoRequest.getFechaHoraFin());
        return ResponseEntity.ok(EventoResponse.fromEntity(actualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvento(@PathVariable Integer id)
            throws EventoInexistenteException, EventoEnUsoException {
        eventosService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoResponse> postEvento(@RequestBody EventoRequest eventoRequest)
            throws LocacionInexsistenteException, TituloEventoEnUsoException, FechaEventoInvalidaException,
            EventoInvalidoException, CategoryInexistenteException {
        Evento creado = eventosService.crearEvento(eventoRequest.getTitulo(), eventoRequest.getDescripcion(),
                eventoRequest.getEstado(), eventoRequest.getLocacion_id(), eventoRequest.getCategoria_id(), eventoRequest.getFechaHoraInicio(),
                eventoRequest.getFechaHoraFin());
        return ResponseEntity.created(URI.create("/eventos/" + creado.getId()))
                .body(EventoResponse.fromEntity(creado));
    }

}
