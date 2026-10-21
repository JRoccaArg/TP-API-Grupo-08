package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos del tipo de entrada son invalidos")
public class TipoEntradaInvalidoException extends Exception {

    public TipoEntradaInvalidoException() {
    }

    // Con un motivo propio: el manejador de errores lo usa en lugar del generico.
    public TipoEntradaInvalidoException(String mensaje) {
        super(mensaje);
    }
}
