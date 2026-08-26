package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;


import lombok.Data;

@Data
public class EventoRequest {
    
    private Integer id;

    private String titulo;

    private String descripcion;

    private LocalDateTime fecha_hora;

    private String estado;

    private Integer locacion_id;
    
}
