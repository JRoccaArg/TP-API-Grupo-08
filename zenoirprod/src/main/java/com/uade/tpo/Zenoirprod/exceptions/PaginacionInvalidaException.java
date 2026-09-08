package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Parametros de paginacion invalidos")
public class PaginacionInvalidaException extends Exception {

    public PaginacionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
