package com.uade.tpo.Zenoirprod.controllers;

import java.math.BigDecimal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaRequest;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaResponseDTO;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.service.EventoTipoEntradaService;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

@RestController
@RequestMapping("eventosTiposEntrada")
public class EventoTipoEntradaController {

    @Autowired
    private EventoTipoEntradaService eventoTipoEntradaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoTipoEntradaResponseDTO> crear(
            @RequestBody EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInvalidoException,
            EventoTipoEntradaDuplicadoException,
            EventoInexistenteException,
            TipoEntradaInexistenteException {

        EventoTipoEntrada creado = eventoTipoEntradaService.crear(request);

        return ResponseEntity
                .created(URI.create("/eventosTiposEntrada/" + creado.getId()))
                .body(toResponseDTO(creado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoTipoEntradaResponseDTO> getPorId(
            @PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException {

        EventoTipoEntrada entrada =
                eventoTipoEntradaService.getPorId(id);

        return ResponseEntity.ok(toResponseDTO(entrada));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<Page<EventoTipoEntradaResponseDTO>> getPorEvento(
            @PathVariable Integer eventoId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size)
            throws EventoInexistenteException, PaginacionInvalidaException {

        Page<EventoTipoEntradaResponseDTO> respuesta =
                eventoTipoEntradaService
                        .getPorEvento(eventoId, PageableFactory.crear(page, size))
                        .map(this::toResponseDTO);

        return ResponseEntity.ok(respuesta);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoTipoEntradaResponseDTO> actualizar(
            @PathVariable Integer id,
            @RequestBody EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInexistenteException,
            EventoTipoEntradaInvalidoException {

        EventoTipoEntrada actualizado =
                eventoTipoEntradaService.actualizar(id, request);

        return ResponseEntity.ok(toResponseDTO(actualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaEnUsoException {

        eventoTipoEntradaService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/precio")
    public ResponseEntity<BigDecimal> getPrecioFinal(
            @PathVariable Integer id)
            throws EventoTipoEntradaInexistenteException {

        return ResponseEntity.ok(
                eventoTipoEntradaService.getPrecioFinal(id)
        );
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<Boolean> hayDisponibilidad(
            @PathVariable Integer id,
            @RequestParam Integer cantidad)
            throws EventoTipoEntradaInexistenteException {

        return ResponseEntity.ok(
                eventoTipoEntradaService.hayDisponibilidad(id, cantidad)
        );
    }

    /*
     * Convierte la entidad interna en el DTO que se expone por la API.
     * De esta manera no devolvemos Evento y TipoEntrada completos.
     */
    private EventoTipoEntradaResponseDTO toResponseDTO(
            EventoTipoEntrada entrada) {

        BigDecimal precioFinal =
                PrecioCalculator.precioConDescuento(
                        entrada.getPrecio(),
                        entrada.getPorcentajeDescuento()
                );

        return EventoTipoEntradaResponseDTO.builder()
                .id(entrada.getId())

                .eventoId(entrada.getEvento().getId())
                .eventoTitulo(entrada.getEvento().getTitulo())

                .tipoEntradaId(entrada.getTipoEntrada().getId())
                .tipoEntradaNombre(entrada.getTipoEntrada().getNombre())

                .precio(entrada.getPrecio())
                .porcentajeDescuento(
                        entrada.getPorcentajeDescuento()
                )
                .precioFinal(precioFinal)

                .cantidadTotal(entrada.getCantidadTotal())
                .cantidadDisponible(
                        entrada.getCantidadDisponible()
                )

                .fechaInicioVenta(
                        entrada.getFechaInicioVenta()
                )
                .fechaFinVenta(
                        entrada.getFechaFinVenta()
                )

                .estado(entrada.getEstado())

                .build();
    }
}
