package com.uade.tpo.Zenoirprod.entity.dto;

import com.uade.tpo.Zenoirprod.entity.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Integer id;
    private String nombre;
    private Boolean activo;

    public static CategoryResponse fromEntity(Category c) {
        if (c == null) return null;
        return CategoryResponse.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .activo(c.getActivo())
                .build();
    }
}
