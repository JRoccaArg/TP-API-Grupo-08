package com.uade.tpo.Zenoirprod.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service("authorizationService")
@RequiredArgsConstructor
public class AuthorizationService {

    private final CompraRepository compraRepository;
    private final TicketRepository ticketRepository;

    // La compra tiene que existir y ser del usuario que la pide. Si no existe no autoriza (se traduce en 403).
    public boolean puedeAccederCompra(Integer compraId, Authentication authentication) {
        if (compraId == null || authentication == null) {
            return false;
        }
        return compraRepository.findById(compraId)
                .map(compra -> esElUsuario(compra.getUsuario().getEmail(), authentication))
                .orElse(false);
    }

    public boolean puedeAccederTicket(Integer ticketId, Authentication authentication) {
        if (ticketId == null || authentication == null) {
            return false;
        }
        if (!ticketRepository.existsById(ticketId)) {
            return false;
        }
        return ticketRepository.perteneceAUsuario(ticketId, authentication.getName());
    }

    // Verifica que el email del usuario que hace la petición coincide con el email del usuario al que quiere acceder
    private boolean esElUsuario(String email, Authentication authentication) {
        return authentication != null && email.equals(authentication.getName());
    }
}
