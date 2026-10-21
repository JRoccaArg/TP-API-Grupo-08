package com.uade.tpo.Zenoirprod.util;

import org.springframework.security.core.Authentication;

import com.uade.tpo.Zenoirprod.entity.Evento;

// Quien es administrador y que puede ver: los eventos en BORRADOR (todavia no publicados) solo los ve un administrador.
public final class Permisos {

    private Permisos() {
    }

    // "authentication" es null o anonimo cuando quien consulta no inicio sesion.
    public static boolean esAdmin(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities().stream().anyMatch(permiso -> "ROLE_ADMIN".equals(permiso.getAuthority()));
    }

    public static boolean puedeVer(Evento evento, Authentication authentication) {
        return !"BORRADOR".equalsIgnoreCase(evento.getEstado()) || esAdmin(authentication);
    }
}
