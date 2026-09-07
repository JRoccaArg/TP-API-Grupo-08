package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.controllers.auth.AuthenticationRequest;
import com.uade.tpo.Zenoirprod.controllers.auth.AuthenticationResponse;
import com.uade.tpo.Zenoirprod.controllers.auth.RegisterRequest;
import com.uade.tpo.Zenoirprod.controllers.config.JwtService;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.exceptions.CredencialesInvalidasException;
import com.uade.tpo.Zenoirprod.exceptions.DatosAutenticacionInvalidosException;
import com.uade.tpo.Zenoirprod.exceptions.DniEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EmailEnUsoException;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request)
            throws DatosAutenticacionInvalidosException, EmailEnUsoException, DniEnUsoException {
        if (request == null
                || request.getFirstname() == null || request.getFirstname().isBlank()
                || request.getLastname() == null || request.getLastname().isBlank()
                || request.getDni() == null || request.getDni().isBlank()
                || request.getFechaNacimiento() == null
                || request.getFechaNacimiento().isAfter(LocalDate.now())
                || request.getEmail() == null || request.getEmail().isBlank()
                || !request.getEmail().contains("@")
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new DatosAutenticacionInvalidosException();
        }

        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailEnUsoException();
        }
        if (repository.findByDni(request.getDni()).isPresent()) {
            throw new DniEnUsoException();
        }

        User user = User.builder()
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .dni(request.getDni())
                .fechaNacimiento(request.getFechaNacimiento())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .fechaRegistro(LocalDateTime.now())
                .activo(true)
                .build();

        repository.save(user);

        return AuthenticationResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request)
            throws DatosAutenticacionInvalidosException, CredencialesInvalidasException {
        if (request == null
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new DatosAutenticacionInvalidosException();
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        }
        catch (AuthenticationException e) {
            throw new CredencialesInvalidasException();
        }

        User user = repository.findByEmail(request.getEmail())
                .orElseThrow(CredencialesInvalidasException::new);

        return AuthenticationResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .build();
    }
}
