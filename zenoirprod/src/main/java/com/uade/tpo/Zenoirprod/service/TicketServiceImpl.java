package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.exceptions.TicketInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TicketNoUtilizableException;
import com.uade.tpo.Zenoirprod.repository.TicketRepository;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired private TicketRepository ticketRepository;

    @Override
    public Optional<Ticket> getPorId(Integer id) {
        return ticketRepository.findById(id);
    }

    @Override
    public Optional<Ticket> getPorCodigoQr(String codigoQr) {
        return ticketRepository.findByCodigoQr(codigoQr);
    }

    @Override
    @Transactional
    public Ticket utilizar(String codigoQr) throws TicketInexistenteException, TicketNoUtilizableException {
        Ticket ticket = ticketRepository.findByCodigoQr(codigoQr)
                .orElseThrow(TicketInexistenteException::new);
        if (ticket.getEstado() != EstadoTicket.EMITIDO) {
            throw new TicketNoUtilizableException();
        }
        ticket.setEstado(EstadoTicket.UTILIZADO);
        ticket.setFechaUtilizacion(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}
