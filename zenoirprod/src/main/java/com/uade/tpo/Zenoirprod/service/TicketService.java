package com.uade.tpo.Zenoirprod.service;

import java.util.Optional;

import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;

public interface TicketService {

    Optional<Ticket> getPorId(Integer id);

    Optional<Ticket> getPorCodigoQr(String codigoQr);

    Ticket utilizar(String codigoQr) throws TicketInexistenteException, TicketNoUtilizableException;
}
