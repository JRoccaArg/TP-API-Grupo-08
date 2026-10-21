package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos de autenticacion son invalidos")
public class DatosAutenticacionInvalidosException extends Exception {

    public DatosAutenticacionInvalidosException() {
    }

    public DatosAutenticacionInvalidosException(String mensaje) {
        super(mensaje);
    }
}
