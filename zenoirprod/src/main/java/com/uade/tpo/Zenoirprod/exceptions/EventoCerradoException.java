package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Es un EventoTipoEntradaInvalidoException: se lanza donde ya se declara esa, con su propio estado y mensaje.
@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El evento ya finalizo o fue cancelado, no se le pueden cargar entradas")
public class EventoCerradoException extends EventoTipoEntradaInvalidoException {
}
