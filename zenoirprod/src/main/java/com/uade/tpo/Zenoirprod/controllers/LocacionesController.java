package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.dto.LocacionRequest;
import com.uade.tpo.Zenoirprod.entity.dto.LocacionResponse;
import com.uade.tpo.Zenoirprod.exceptions.LocacionDuplicadaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.service.LocacionService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

@RestController
@RequestMapping("locaciones")
public class LocacionesController {

    @Autowired
    private LocacionService locacionService;

    @GetMapping
    public ResponseEntity<Page<LocacionResponse>> getLocaciones(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        Page<Locacion> pagina = locacionService.getLocaciones(PageableFactory.crear(page, size));
        return ResponseEntity.ok(pagina.map(LocacionResponse::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocacionResponse> getLocacionPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(LocacionResponse.fromEntity(locacionService.getLocacionPorId(id)));
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocacionResponse> crearLocacion(@RequestBody LocacionRequest locacionRequest)
            throws LocacionInvalidaException, LocacionDuplicadaException {
        Locacion creada = locacionService.crearLocacion(
                locacionRequest.getNombre(),
                locacionRequest.getDireccion(),
                locacionRequest.getCapacidadMax());
        return ResponseEntity.ok(LocacionResponse.fromEntity(creada));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocacionResponse> updateLocacion(@PathVariable Integer id,
            @RequestBody LocacionRequest locacionRequest)
            throws LocacionInvalidaException, LocacionDuplicadaException {
        try {
            Locacion actualizada = locacionService.updateLocacion(
                    id,
                    locacionRequest.getNombre(),
                    locacionRequest.getDireccion(),
                    locacionRequest.getCapacidadMax());
            return ResponseEntity.ok(LocacionResponse.fromEntity(actualizada));
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLocacion(@PathVariable Integer id) {
        try {
            locacionService.deleteLocacion(id);
            return ResponseEntity.noContent().build();
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        } catch (LocacionEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
