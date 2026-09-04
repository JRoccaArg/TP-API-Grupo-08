package com.uade.tpo.Zenoirprod.entity.dto;

import lombok.Data;

@Data
public class LocacionRequest {

    private Integer id;

    private String nombre;

    private String direccion;

    private Integer capacidadMax;
}
