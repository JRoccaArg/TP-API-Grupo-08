package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

// Resultado de la consulta de ventas: cuantas entradas se vendieron y cuanto se recaudo por cada entrada del evento.
@Data
@AllArgsConstructor
public class VentaPorEntrada {

    private Integer eventoTipoEntradaId;
    private Long vendidas;
    private BigDecimal recaudado;
}
