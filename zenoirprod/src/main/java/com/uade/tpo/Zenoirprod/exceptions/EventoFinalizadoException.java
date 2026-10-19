package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Es un EventoNoDisponibleException: donde ya se declara esa, esta se puede lanzar sin tocar firmas.
@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El evento ya finalizo, no se pueden comprar entradas")
public class EventoFinalizadoException extends EventoNoDisponibleException {
}
