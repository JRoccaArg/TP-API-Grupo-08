package com.uade.tpo.Zenoirprod.exceptions;

import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.uade.tpo.Zenoirprod.entity.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

// Punto unico donde las excepciones se traducen a una respuesta HTTP con el motivo del error.
@Slf4j
@RestControllerAdvice
public class ManejadorErrores {

    // Traduce nuestras excepciones usando el status y el motivo que cada una declara en su @ResponseStatus.
    // Si la excepcion no lo declara (errores inesperados, 403 de seguridad, 405, etc.) se vuelve a lanzar
    // para que Spring la resuelva como siempre.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> manejarExcepcionPropia(Exception ex, HttpServletRequest request)
            throws Exception {
        ResponseStatus declarado = AnnotatedElementUtils.findMergedAnnotation(ex.getClass(), ResponseStatus.class);
        if (declarado == null) {
            throw ex;
        }
        return responder(declarado.code(), declarado.reason(), request);
    }

    // Red de seguridad: la base rechazo la operacion por una restriccion que ninguna validacion previa contemplo
    // (valor duplicado, registro referenciado). El detalle (nombre de restriccion, tabla) queda solo en el log.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> manejarRestriccionDeDatos(DataIntegrityViolationException ex,
            HttpServletRequest request) {
        log.warn("Restriccion de datos violada en {}: {}", request.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT,
                "La operacion no se pudo completar: el valor ya existe o el registro esta en uso", request);
    }

    // JSON mal formado, vacio o con tipos incorrectos.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> manejarCuerpoInvalido(HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST,
                "El cuerpo de la solicitud esta vacio o tiene un formato invalido", request);
    }

    // Parametro de URL o query con un tipo incorrecto (por ejemplo /eventos/abc).
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> manejarParametroInvalido(MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST,
                "El parametro '" + ex.getName() + "' tiene un valor invalido", request);
    }

    private ResponseEntity<ErrorResponse> responder(HttpStatus status, String motivo, HttpServletRequest request) {
        String mensaje = (motivo == null || motivo.isBlank()) ? status.getReasonPhrase() : motivo;
        return ResponseEntity.status(status).body(ErrorResponse.of(status, mensaje, request.getRequestURI()));
    }
}
