package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.dto.TicketResponse;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;
import com.uade.tpo.Zenoirprod.service.TicketService;

@RestController
@RequestMapping("tickets")
public class TicketsController {

    @Autowired private TicketService service;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and @authorizationService.puedeAccederTicket(#id, authentication))")
    public ResponseEntity<TicketResponse> getPorId(@PathVariable Integer id) {
        return service.getPorId(id)
                .map(TicketResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/qr/{codigoQr}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> getPorCodigoQr(@PathVariable String codigoQr) {
        return service.getPorCodigoQr(codigoQr)
                .map(TicketResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/qr/{codigoQr}/utilizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> utilizar(@PathVariable String codigoQr)
            throws TicketInexistenteException, TicketNoUtilizableException {
        return ResponseEntity.ok(TicketResponse.fromEntity(service.utilizar(codigoQr)));
    }
}
