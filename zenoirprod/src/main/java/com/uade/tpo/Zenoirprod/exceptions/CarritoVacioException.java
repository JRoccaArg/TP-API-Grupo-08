package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El carrito esta vacio, agregue entradas antes de comprar")
public class CarritoVacioException extends Exception {
}
