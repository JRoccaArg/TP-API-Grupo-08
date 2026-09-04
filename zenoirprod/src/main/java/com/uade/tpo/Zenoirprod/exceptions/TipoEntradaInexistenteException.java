package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "El tipo de entrada que se intenta acceder no existe")
public class TipoEntradaInexistenteException extends Exception {

}
