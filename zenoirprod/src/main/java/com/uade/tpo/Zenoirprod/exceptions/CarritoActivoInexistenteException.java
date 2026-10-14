package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "No hay un carrito activo: todavia no se agregaron entradas, o el tiempo de reserva vencio y las entradas fueron liberadas")
public class CarritoActivoInexistenteException extends Exception {
}
