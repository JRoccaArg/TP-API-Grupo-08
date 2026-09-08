package com.uade.tpo.Zenoirprod.entity.dto;

import com.uade.tpo.Zenoirprod.entity.Locacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocacionResponse {

    private Integer id;
    private String nombre;
    private String direccion;

    public static LocacionResponse fromEntity(Locacion l) {
        if (l == null) return null;
        return LocacionResponse.builder()
                .id(l.getId())
                .nombre(l.getNombre())
                .direccion(l.getDireccion())
                .build();
    }
}
