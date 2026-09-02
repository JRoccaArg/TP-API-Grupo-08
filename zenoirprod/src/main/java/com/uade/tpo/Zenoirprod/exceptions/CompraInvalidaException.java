package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "La compra es invalida: la lista de items no puede estar vacia y la cantidad debe ser mayor a cero")
public class CompraInvalidaException extends Exception {
}
