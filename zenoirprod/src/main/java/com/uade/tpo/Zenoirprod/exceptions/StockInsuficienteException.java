package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "No hay stock suficiente para la cantidad solicitada")
public class StockInsuficienteException extends Exception {

    public StockInsuficienteException() {
    }

    // Con el detalle de que entrada falto y cuantas quedan. ManejadorErrores usa este mensaje en lugar del generico.
    public StockInsuficienteException(String detalle) {
        super(detalle);
    }
}
