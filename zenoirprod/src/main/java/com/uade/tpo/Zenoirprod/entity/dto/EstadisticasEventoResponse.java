package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Estadísticas de un evento: solo cuentan las compras confirmadas y lo recaudado es lo que se pagó, no el precio actual
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasEventoResponse {

    private Integer eventoId;
    private long vendidas;
    private long cupoTotal;
    private BigDecimal recaudado;
    private long compras;
    private long ingresados;
    private List<PorEntrada> porEntrada;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PorEntrada {
        private Integer eventoTipoEntradaId;
        private String tipoEntradaNombre;
        private String estado;
        private int cupo;
        private int disponibles;
        private long vendidas;
        private BigDecimal recaudado;
    }
}
