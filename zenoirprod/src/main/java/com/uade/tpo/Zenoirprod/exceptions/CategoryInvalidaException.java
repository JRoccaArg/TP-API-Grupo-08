package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Los datos de la categoria son invalidos")
public class CategoryInvalidaException extends Exception {

    public CategoryInvalidaException() {
    }

    public CategoryInvalidaException(String mensaje) {
        super(mensaje);
    }
}
