package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "La imagen de la locacion es invalida")
public class ImagenLocacionInvalidaException extends Exception {

    public ImagenLocacionInvalidaException() {
    }

    // Con un motivo propio: el manejador de errores lo usa en lugar del generico.
    public ImagenLocacionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
