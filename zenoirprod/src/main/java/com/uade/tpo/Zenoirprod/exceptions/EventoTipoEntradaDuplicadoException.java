package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El evento ya tiene configurado ese tipo de entrada")
public class EventoTipoEntradaDuplicadoException extends Exception {
}
