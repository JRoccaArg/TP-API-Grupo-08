package com.uade.tpo.Zenoirprod.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;
import com.uade.tpo.Zenoirprod.service.TicketService;

@RestController
@RequestMapping("tickets")
public class TicketsController {

    @Autowired private TicketService service;

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getPorId(@PathVariable Integer id) {
        Optional<Ticket> resultado = service.getPorId(id);
        return resultado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/qr/{codigoQr}")
    public ResponseEntity<Ticket> getPorCodigoQr(@PathVariable String codigoQr) {
        Optional<Ticket> resultado = service.getPorCodigoQr(codigoQr);
        return resultado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/qr/{codigoQr}/utilizar")
    public ResponseEntity<Ticket> utilizar(@PathVariable String codigoQr)
            throws TicketInexistenteException, TicketNoUtilizableException {
        return ResponseEntity.ok(service.utilizar(codigoQr));
    }
}
