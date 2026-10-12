package com.uade.tpo.Zenoirprod.controllers.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.service.AuthenticationService;
import com.uade.tpo.Zenoirprod.exceptions.CredencialesInvalidasException;
import com.uade.tpo.Zenoirprod.exceptions.DatosAutenticacionInvalidosException;
import com.uade.tpo.Zenoirprod.exceptions.DniEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EmailEnUsoException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request)
            throws DatosAutenticacionInvalidosException, EmailEnUsoException, DniEnUsoException {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request)
            throws DatosAutenticacionInvalidosException, CredencialesInvalidasException {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
