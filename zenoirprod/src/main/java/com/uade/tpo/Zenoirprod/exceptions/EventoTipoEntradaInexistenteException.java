package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "La configuracion de entrada para el evento no existe")
public class EventoTipoEntradaInexistenteException extends Exception {
}
