package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "Ya existe un tipo de entrada con ese nombre")
public class TipoEntradaDuplicadoException extends Exception {
}
