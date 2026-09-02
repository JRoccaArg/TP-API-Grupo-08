package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

/* 409: no se puede borrar una locación que todavía tiene eventos */
@ResponseStatus(code = HttpStatus.CONFLICT, reason = "La locacion que se intenta eliminar esta en uso por uno o mas eventos")
public class LocacionEnUsoException extends Exception {

}
