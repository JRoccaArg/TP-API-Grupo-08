package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VentaPorEntrada {

    private Integer eventoTipoEntradaId;
    private Long vendidas;
    private BigDecimal recaudado;
}
