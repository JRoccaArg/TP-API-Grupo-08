package com.uade.tpo.Zenoirprod.controllers.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(service.register(request));
        }
        catch (DatosAutenticacionInvalidosException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (EmailEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        catch (DniEnUsoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        }
        catch (DatosAutenticacionInvalidosException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (CredencialesInvalidasException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
