package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos de la locacion son invalidos")
public class LocacionInvalidaException extends Exception {

    public LocacionInvalidaException() {
    }

    // Con un motivo propio: el manejador de errores lo usa en lugar del generico.
    public LocacionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
