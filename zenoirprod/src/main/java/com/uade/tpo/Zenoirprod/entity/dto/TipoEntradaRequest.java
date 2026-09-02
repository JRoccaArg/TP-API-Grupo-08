package com.uade.tpo.Zenoirprod.entity.dto;

import lombok.Data;

@Data
public class TipoEntradaRequest {

    private Integer id;

    private String nombre;

    private String descripcionBase;

    private Boolean activo;
}
