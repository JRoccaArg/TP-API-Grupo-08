package com.uade.tpo.Zenoirprod.controllers.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.entity.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Respuestas de seguridad (401 y 403). Se resuelven en el filtro de Spring Security, antes de llegar a los
// controllers, por eso no las puede tomar el ManejadorErrores. Los mensajes son siempre los mismos a proposito:
// no se aclara si falta el token, si esta vencido, si el recurso existe ni que condicion fallo.
@Component
@RequiredArgsConstructor
public class ManejadorErroresSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    // Sin token, o token invalido o vencido.
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        escribir(request, response, HttpStatus.UNAUTHORIZED, "Debe iniciar sesion para acceder a este recurso");
    }

    // Usuario autenticado sin permiso para la operacion (o para ese recurso).
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        escribir(request, response, HttpStatus.FORBIDDEN, "No tiene permisos para realizar esta accion");
    }

    private void escribir(HttpServletRequest request, HttpServletResponse response, HttpStatus status,
            String mensaje) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(),
                ErrorResponse.of(status, mensaje, request.getRequestURI()));
    }
}
