package com.uade.tpo.Zenoirprod.entity.dto;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoEntradaResponse {

    private Integer id;
    private String nombre;
    private String descripcionBase;
    private Boolean activo;

    public static TipoEntradaResponse fromEntity(TipoEntrada t) {
        if (t == null) return null;
        return TipoEntradaResponse.builder()
                .id(t.getId())
                .nombre(t.getNombre())
                .descripcionBase(t.getDescripcionBase())
                .activo(t.getActivo())
                .build();
    }
}
