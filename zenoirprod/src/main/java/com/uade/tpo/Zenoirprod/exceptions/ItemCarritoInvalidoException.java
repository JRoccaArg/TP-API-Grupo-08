package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "El item es invalido: falta el eventoTipoEntradaId o la cantidad debe ser mayor a cero")
public class ItemCarritoInvalidoException extends Exception {
}
