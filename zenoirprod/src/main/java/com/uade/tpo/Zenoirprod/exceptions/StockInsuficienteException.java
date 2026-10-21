package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "No hay stock suficiente para la cantidad solicitada")
public class StockInsuficienteException extends Exception {

    public StockInsuficienteException() {
    }

    public StockInsuficienteException(String detalle) {
        super(detalle);
    }
}
