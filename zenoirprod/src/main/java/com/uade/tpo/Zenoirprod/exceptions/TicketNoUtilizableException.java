package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "El ticket no se puede utilizar (ya fue usado o esta cancelado)")
public class TicketNoUtilizableException extends Exception {
}
