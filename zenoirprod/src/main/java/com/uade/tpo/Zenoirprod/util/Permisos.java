package com.uade.tpo.Zenoirprod.util;

import org.springframework.security.core.Authentication;

import com.uade.tpo.Zenoirprod.entity.Evento;

// Quién es admin. Los eventos en BORRADOR (sin publicar) solo los ve un admin
public final class Permisos {

    private Permisos() {
    }

    public static boolean esAdmin(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities().stream().anyMatch(permiso -> "ROLE_ADMIN".equals(permiso.getAuthority()));
    }

    public static boolean puedeVer(Evento evento, Authentication authentication) {
        return !"BORRADOR".equalsIgnoreCase(evento.getEstado()) || esAdmin(authentication);
    }
}
