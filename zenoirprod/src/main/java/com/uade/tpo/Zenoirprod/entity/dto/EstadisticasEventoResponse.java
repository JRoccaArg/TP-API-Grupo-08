package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Como viene un evento: entradas vendidas sobre el cupo, lo recaudado, cuantas compras hubo y cuantos ya ingresaron.
// Solo cuentan las compras confirmadas; lo recaudado es lo que se pago (no el precio actual de la entrada).
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
