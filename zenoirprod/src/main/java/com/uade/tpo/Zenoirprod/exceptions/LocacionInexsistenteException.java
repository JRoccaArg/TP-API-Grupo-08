package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "La locacion que se intenta acceder no existe")
public class LocacionInexsistenteException extends Exception {
    
}
