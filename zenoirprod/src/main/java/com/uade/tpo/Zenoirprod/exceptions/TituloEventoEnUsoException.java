package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El titulo del evento que se intenta crear ya esta en uso")
public class TituloEventoEnUsoException extends Exception {
}
