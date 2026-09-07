package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El evento no esta activo, no se pueden comprar entradas")
public class EventoNoDisponibleException extends Exception {
}
