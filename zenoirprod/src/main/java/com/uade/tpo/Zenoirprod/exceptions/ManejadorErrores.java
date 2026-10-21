package com.uade.tpo.Zenoirprod.exceptions;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.TypeMismatchException;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.uade.tpo.Zenoirprod.entity.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

// Acá se traducen las excepciones a una respuesta HTTP con el motivo del error. Extiende ResponseEntityExceptionHandler para que
// los errores de Spring (método no permitido, JSON roto, ruta inexistente) salgan con el mismo formato. Las 401/403 van por ManejadorErroresSeguridad.
@Slf4j
@RestControllerAdvice
public class ManejadorErrores extends ResponseEntityExceptionHandler {

    private static final String ERROR_INESPERADO = "Ocurrio un error inesperado, intente nuevamente mas tarde";

    // Excepciones de negocio: status y motivo salen de su @ResponseStatus (o de su mensaje propio). Las de seguridad se relanzan.
    // Cualquier otra es un error inesperado: el detalle queda en el log y el cliente no recibe datos internos.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> manejarExcepcion(Exception ex, HttpServletRequest request)
            throws Exception {
        ResponseStatus declarado = AnnotatedElementUtils.findMergedAnnotation(ex.getClass(), ResponseStatus.class);
        if (declarado != null) {
            String motivo = (ex.getMessage() != null && !ex.getMessage().isBlank()) ? ex.getMessage()
                    : declarado.reason();
            return responder(declarado.code(), motivo, request);
        }
        if (ex instanceof AccessDeniedException || ex instanceof AuthenticationException) {
            throw ex;
        }
        if (ex instanceof MaxUploadSizeExceededException) {
            return responder(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo supera el tamano maximo permitido", request);
        }
        if (ex instanceof MultipartException) {
            return responder(HttpStatus.BAD_REQUEST,
                    "La solicitud debe enviarse como multipart/form-data con el archivo adjunto", request);
        }
        log.error("Error inesperado en {} {}", request.getMethod(), request.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_INESPERADO, request);
    }

    // Red de seguridad: la base rechazó la operación por una restricción que no se validó antes (duplicado, registro
    // referenciado). El detalle queda solo en el log.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> manejarRestriccionDeDatos(DataIntegrityViolationException ex,
            HttpServletRequest request) {
        log.warn("Restriccion de datos violada en {}: {}", request.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT,
                "La operacion no se pudo completar: el valor ya existe o el registro esta en uso", request);
    }

    // Dos operaciones esperaron por el mismo stock (o la base abortó una por deadlock): se puede reintentar
    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> manejarBloqueo(PessimisticLockingFailureException ex,
            HttpServletRequest request) {
        log.warn("Bloqueo no obtenido en {}: {}", request.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT,
                "Otra operacion esta usando las mismas entradas en este momento, intente nuevamente", request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(statusCode.value());
        String uri = ((ServletWebRequest) request).getRequest().getRequestURI();

        String mensaje;
        if (status.is5xxServerError()) {
            log.error("Error inesperado en {}", uri, ex);
            mensaje = ERROR_INESPERADO;
        } else {
            mensaje = mensajePara(ex);
        }

        // Se fija JSON para poder escribir el error aunque el Accept del cliente no lo admita
        HttpHeaders respuesta = new HttpHeaders();
        respuesta.putAll(headers);
        respuesta.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(ErrorResponse.of(status, mensaje, uri), respuesta, status);
    }

    private String mensajePara(Exception ex) {
        if (ex instanceof HttpRequestMethodNotSupportedException e) {
            Set<HttpMethod> permitidos = e.getSupportedHttpMethods();
            String detalle = (permitidos == null || permitidos.isEmpty()) ? ""
                    : ". Metodos permitidos: "
                            + permitidos.stream().map(HttpMethod::name).collect(Collectors.joining(", "));
            return "El metodo " + e.getMethod() + " no esta permitido en esta ruta" + detalle;
        }
        if (ex instanceof HttpMediaTypeNotSupportedException e) {
            String detalle = e.getSupportedMediaTypes().isEmpty() ? ""
                    : ". Tipos aceptados: "
                            + e.getSupportedMediaTypes().stream().map(MediaType::toString)
                                    .collect(Collectors.joining(", "));
            return "El tipo de contenido enviado no es soportado" + detalle;
        }
        if (ex instanceof HttpMediaTypeNotAcceptableException) {
            return "El servidor no puede responder en el formato pedido en el encabezado Accept";
        }
        if (ex instanceof MissingServletRequestParameterException e) {
            return "Falta el parametro obligatorio '" + e.getParameterName() + "'";
        }
        if (ex instanceof MissingServletRequestPartException e) {
            return "Falta la parte obligatoria '" + e.getRequestPartName() + "' de la solicitud";
        }
        if (ex instanceof MethodArgumentTypeMismatchException e) {
            return "El parametro '" + e.getName() + "' tiene un valor invalido";
        }
        if (ex instanceof TypeMismatchException) {
            return "Un parametro de la solicitud tiene un valor invalido";
        }
        if (ex instanceof HttpMessageNotReadableException) {
            return "El cuerpo de la solicitud esta vacio o tiene un formato invalido";
        }
        if (ex instanceof MethodArgumentNotValidException) {
            return "Los datos enviados son invalidos";
        }
        if (ex instanceof NoHandlerFoundException) {
            return "La ruta solicitada no existe";
        }
        return "La solicitud no pudo procesarse, revise los datos enviados";
    }

    private ResponseEntity<ErrorResponse> responder(HttpStatus status, String motivo, HttpServletRequest request) {
        String mensaje = (motivo == null || motivo.isBlank()) ? status.getReasonPhrase() : motivo;
        return ResponseEntity.status(status).body(ErrorResponse.of(status, mensaje, request.getRequestURI()));
    }
}
