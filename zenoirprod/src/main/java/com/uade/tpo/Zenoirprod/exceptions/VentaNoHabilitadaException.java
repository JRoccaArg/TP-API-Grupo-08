package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "La venta de este tipo de entrada no esta habilitada en esta fecha")
public class VentaNoHabilitadaException extends Exception {
}
