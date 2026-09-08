package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "No hay devoluciones: solo se puede cancelar una compra si el evento fue cancelado")
public class DevolucionNoPermitidaException extends Exception {
}
