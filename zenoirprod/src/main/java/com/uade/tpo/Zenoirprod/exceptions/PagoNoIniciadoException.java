package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "Antes de pagar hay que iniciar el pago del carrito (pantalla de pago)")
public class PagoNoIniciadoException extends Exception {
}
