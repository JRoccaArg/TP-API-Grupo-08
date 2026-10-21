package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

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
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;
import com.uade.tpo.Zenoirprod.util.Textos;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private static final int EDAD_MINIMA = 18;
    private static final int EDAD_MAXIMA = 120;
    private static final int LARGO_MAXIMO_NOMBRE = 100;
    private static final int LARGO_MAXIMO_EMAIL = 254;
    private static final Pattern DNI = Pattern.compile("^\\d{7,8}$");
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern MAYUSCULA = Pattern.compile("[A-ZÁÉÍÓÚÑ]");
    private static final Pattern MINUSCULA = Pattern.compile("[a-záéíóúñ]");
    private static final Pattern NUMERO = Pattern.compile("\\d");
    private static final Pattern SIMBOLO = Pattern.compile("[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\\s]");

    public AuthenticationResponse register(RegisterRequest request)
            throws DatosAutenticacionInvalidosException, EmailEnUsoException, DniEnUsoException {
        validarRegistro(request);

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
                .fechaRegistro(FechaCatalogo.ahora())
                .activo(true)
                .build();

        repository.save(user);

        return respuesta(user);
    }

    // Cada dato se valida por separado para decir cuál está mal. La contraseña pide lo mismo que el formulario del front
    // (8 a 64 caracteres con mayúscula, minúscula, número y símbolo). Solo se aceptan mayores de edad.
    private void validarRegistro(RegisterRequest request) throws DatosAutenticacionInvalidosException {
        if (request == null) {
            throw new DatosAutenticacionInvalidosException();
        }
        if (Textos.vacio(request.getFirstname()) || Textos.excede(request.getFirstname(), LARGO_MAXIMO_NOMBRE)) {
            throw new DatosAutenticacionInvalidosException("El nombre es obligatorio y no puede superar los 100 caracteres");
        }
        if (Textos.vacio(request.getLastname()) || Textos.excede(request.getLastname(), LARGO_MAXIMO_NOMBRE)) {
            throw new DatosAutenticacionInvalidosException("El apellido es obligatorio y no puede superar los 100 caracteres");
        }
        if (Textos.vacio(request.getDni()) || !DNI.matcher(request.getDni()).matches()) {
            throw new DatosAutenticacionInvalidosException("El DNI debe tener 7 u 8 digitos, sin puntos");
        }
        LocalDate hoy = FechaCatalogo.ahora().toLocalDate();
        LocalDate nacimiento = request.getFechaNacimiento();
        if (nacimiento == null || nacimiento.isAfter(hoy) || nacimiento.isBefore(hoy.minusYears(EDAD_MAXIMA))) {
            throw new DatosAutenticacionInvalidosException("La fecha de nacimiento no es valida");
        }
        if (nacimiento.isAfter(hoy.minusYears(EDAD_MINIMA))) {
            throw new DatosAutenticacionInvalidosException("Tenes que ser mayor de " + EDAD_MINIMA + " anos para crear una cuenta");
        }
        if (Textos.vacio(request.getEmail()) || request.getEmail().length() > LARGO_MAXIMO_EMAIL
                || !EMAIL.matcher(request.getEmail()).matches()) {
            throw new DatosAutenticacionInvalidosException("El email no es valido");
        }
        String clave = request.getPassword();
        if (clave == null || clave.length() < 8 || clave.length() > 64 || !MAYUSCULA.matcher(clave).find()
                || !MINUSCULA.matcher(clave).find() || !NUMERO.matcher(clave).find() || !SIMBOLO.matcher(clave).find()) {
            throw new DatosAutenticacionInvalidosException(
                    "La contrasena debe tener entre 8 y 64 caracteres, con mayuscula, minuscula, numero y simbolo");
        }
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

        return respuesta(user);
    }

    private AuthenticationResponse respuesta(User user) {
        return AuthenticationResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .role(user.getRole().name())
                .email(user.getEmail())
                .nombre(user.getFirstName())
                .apellido(user.getLastName())
                .build();
    }
}
