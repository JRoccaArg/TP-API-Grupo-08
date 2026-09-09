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

    // Verifica que el usuario que hace la petición es el mismo que el usuario al que quiere acceder.
    // Falla cerrado: si falta el id, la autenticación o el usuario no existe, no autoriza.
    public boolean puedeUsarUsuario(Integer usuarioId, Authentication authentication) {
        if (usuarioId == null || authentication == null) {
            return false;
        }
        return userRepository.findById(usuarioId)
                .map(usuario -> esElUsuario(usuario.getEmail(), authentication))
                .orElse(false);
    }

    // Verifica que el carrito pertenece al usuario que lo pide y que el carrito exista.
    // Falla cerrado: si el carrito no existe no autoriza (se traduce en 403).
    public boolean puedeAccederCarrito(Integer carritoId, Authentication authentication) {
        if (carritoId == null || authentication == null) {
            return false;
        }
        return carritoRepository.findById(carritoId)
                .map(carrito -> esElUsuario(carrito.getUsuario().getEmail(), authentication))
                .orElse(false);
    }

    // Verifica que la compra pertenece al usuario que la pide y que la compra exista.
    // Falla cerrado: si la compra no existe no autoriza (se traduce en 403).
    public boolean puedeAccederCompra(Integer compraId, Authentication authentication) {
        if (compraId == null || authentication == null) {
            return false;
        }
        return compraRepository.findById(compraId)
                .map(compra -> esElUsuario(compra.getUsuario().getEmail(), authentication))
                .orElse(false);
    }

    // Verifica si el ticket pertenece al usuario que lo pide, y que el ticket exista.
    // Falla cerrado en todos los casos: id/auth nulos o ticket inexistente no autorizan.
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
