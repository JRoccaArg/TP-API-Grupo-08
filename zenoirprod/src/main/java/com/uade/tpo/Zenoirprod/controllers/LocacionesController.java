package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.uade.tpo.Zenoirprod.exceptions.LocacionEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.service.LocacionService;

@RestController
@RequestMapping("locaciones")
public class LocacionesController {

    @Autowired
    private LocacionService locacionService;

    @GetMapping
    public ResponseEntity<?> getLocaciones(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page == null || size == null)
            return ResponseEntity.ok(locacionService.getLocaciones(PageRequest.of(0, Integer.MAX_VALUE)));
        return ResponseEntity.ok(locacionService.getLocaciones(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Locacion> getLocacionPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(locacionService.getLocacionPorId(id));
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Locacion> crearLocacion(@RequestBody LocacionRequest locacionRequest) {
        return ResponseEntity.ok(locacionService.crearLocacion(
                locacionRequest.getNombre(),
                locacionRequest.getDireccion(),
                locacionRequest.getCapacidadMax()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Locacion> updateLocacion(@PathVariable Integer id,
            @RequestBody LocacionRequest locacionRequest) {
        try {
            return ResponseEntity.ok(locacionService.updateLocacion(
                    id,
                    locacionRequest.getNombre(),
                    locacionRequest.getDireccion(),
                    locacionRequest.getCapacidadMax()));
        } catch (LocacionInexsistenteException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
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
