package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Hereda de EventoNoDisponibleException para poder lanzarse sin cambiar los "throws" que ya existían
@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El evento ya finalizo, no se pueden comprar entradas")
public class EventoFinalizadoException extends EventoNoDisponibleException {
}
