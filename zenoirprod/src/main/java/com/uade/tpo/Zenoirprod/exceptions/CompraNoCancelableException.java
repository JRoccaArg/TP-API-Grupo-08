package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "No hay entradas para reembolsar: ya se reembolsaron")
public class CompraNoCancelableException extends Exception {
}
