package com.uade.tpo.Zenoirprod.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.TicketRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service("authorizationService")
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;
    private final CarritoRepository carritoRepository;
    private final CompraRepository compraRepository;
    private final TicketRepository ticketRepository;

    // Verifica que el usuario que hace la petición es el mismo que el usuario al que quiere acceder
    public boolean puedeUsarUsuario(Integer usuarioId, Authentication authentication) {
        if (usuarioId == null) {
            return true;
        }
        return userRepository.findById(usuarioId)
                .map(usuario -> esElUsuario(usuario.getEmail(), authentication))
                .orElse(true);
    }
    // Verifica que el carrito pertenece al usuario que lo pide y que el carrito exista
    public boolean puedeAccederCarrito(Integer carritoId, Authentication authentication) {
        return carritoRepository.findById(carritoId)
                .map(carrito -> esElUsuario(carrito.getUsuario().getEmail(), authentication))
                .orElse(true);
    }

    // Verifica que la compra pertenece al usuario que la pide y que la compra exista
    public boolean puedeAccederCompra(Integer compraId, Authentication authentication) {
        return compraRepository.findById(compraId)
                .map(compra -> esElUsuario(compra.getUsuario().getEmail(), authentication))
                .orElse(true);
    }

    // Verifica si el ticket pertenece al usuario que lo pide, y que el ticket exista
    public boolean puedeAccederTicket(Integer ticketId, Authentication authentication) {
        if (ticketId == null || authentication == null) {
            return false;
        }
        if (!ticketRepository.existsById(ticketId)) {
            return true;
        }
        return ticketRepository.perteneceAUsuario(ticketId, authentication.getName());
    }

    // Verifica que el email del usuario que hace la petición coincide con el email del usuario al que quiere acceder
    private boolean esElUsuario(String email, Authentication authentication) {
        return authentication != null && email.equals(authentication.getName());
    }
}
