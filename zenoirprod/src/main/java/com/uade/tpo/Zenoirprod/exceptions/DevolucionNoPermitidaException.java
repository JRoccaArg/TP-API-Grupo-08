package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Politica del negocio: no hay devolucion de entradas. Una compra solo se puede
 * cancelar cuando el evento entero fue cancelado; en cualquier otro caso la
 * plata no se devuelve.
 */
@ResponseStatus(code = HttpStatus.CONFLICT, reason = "No hay devoluciones: solo se puede cancelar una compra si el evento fue cancelado")
public class DevolucionNoPermitidaException extends Exception {
}
