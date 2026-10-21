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
import com.uade.tpo.Zenoirprod.entity.dto.TicketVerificacionResponse;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;
import com.uade.tpo.Zenoirprod.service.TicketService;

@RestController
@RequestMapping("tickets")
public class TicketsController {

    @Autowired private TicketService service;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and @authorizationService.puedeAccederTicket(#id, authentication))")
    public ResponseEntity<TicketResponse> getPorId(@PathVariable Integer id) throws TicketInexistenteException {
        return service.getPorId(id)
                .map(TicketResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseThrow(TicketInexistenteException::new);
    }

    // Consulta el ticket por su QR sin gastarlo
    @GetMapping("/qr/{codigoQr}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketVerificacionResponse> getPorCodigoQr(@PathVariable String codigoQr)
            throws TicketInexistenteException {
        return ResponseEntity.ok(verificacion(codigoQr));
    }

    // Registra el ingreso: pasa el ticket a UTILIZADO (404 si no existe, 409 si ya se usó)
    @PostMapping("/qr/{codigoQr}/utilizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketVerificacionResponse> utilizar(@PathVariable String codigoQr)
            throws TicketInexistenteException, TicketNoUtilizableException {
        service.utilizar(codigoQr);
        return ResponseEntity.ok(verificacion(codigoQr));
    }

    private TicketVerificacionResponse verificacion(String codigoQr) throws TicketInexistenteException {
        return service.getCompraPorCodigoQr(codigoQr)
                .map(compra -> TicketVerificacionResponse.fromCompra(compra, codigoQr))
                .orElseThrow(TicketInexistenteException::new);
    }
}
