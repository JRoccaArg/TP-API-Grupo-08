package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos del evento son invalidos")
public class EventoInvalidoException extends Exception {

    public EventoInvalidoException() {
    }

    // Con un motivo propio: el manejador de errores lo usa en lugar del generico.
    public EventoInvalidoException(String mensaje) {
        super(mensaje);
    }
}
