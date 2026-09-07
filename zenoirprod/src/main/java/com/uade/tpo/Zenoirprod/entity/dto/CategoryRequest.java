package com.uade.tpo.Zenoirprod.entity.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private Integer id;
    private String nombre;
    private Boolean activo;
}
