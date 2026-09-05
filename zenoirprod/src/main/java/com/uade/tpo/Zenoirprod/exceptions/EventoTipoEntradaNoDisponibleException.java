package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El tipo de entrada no esta disponible para la venta")
public class EventoTipoEntradaNoDisponibleException extends Exception {
}
