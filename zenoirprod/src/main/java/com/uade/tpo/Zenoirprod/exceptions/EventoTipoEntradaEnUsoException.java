package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "La entrada esta incluida en un carrito o una compra")
public class EventoTipoEntradaEnUsoException extends Exception {
}
