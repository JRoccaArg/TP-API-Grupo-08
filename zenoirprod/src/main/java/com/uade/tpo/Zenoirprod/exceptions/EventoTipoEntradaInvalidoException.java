package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos del tipo de entrada del evento son invalidos")
public class EventoTipoEntradaInvalidoException extends Exception {

    public EventoTipoEntradaInvalidoException() {
    }

    // Con un motivo propio: el manejador de errores lo usa en lugar del generico.
    public EventoTipoEntradaInvalidoException(String mensaje) {
        super(mensaje);
    }
}
