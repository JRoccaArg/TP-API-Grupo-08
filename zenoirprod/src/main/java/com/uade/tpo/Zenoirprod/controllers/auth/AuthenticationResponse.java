package com.uade.tpo.Zenoirprod.controllers.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    @JsonProperty("access_token")
    private String accessToken;
    // Datos de la cuenta para el front (el token solo lleva el email)
    private String role;
    private String email;
    private String nombre;
    private String apellido;
}
