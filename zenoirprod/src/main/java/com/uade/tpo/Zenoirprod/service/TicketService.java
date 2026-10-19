package com.uade.tpo.Zenoirprod.service;

import java.util.Optional;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;

public interface TicketService {

    Optional<Ticket> getPorId(Integer id);

    // La compra del ticket con ese codigo QR (trae al comprador y el evento), vacia si el codigo no existe.
    Optional<Compra> getCompraPorCodigoQr(String codigoQr);

    Ticket utilizar(String codigoQr) throws TicketInexistenteException, TicketNoUtilizableException;
}
