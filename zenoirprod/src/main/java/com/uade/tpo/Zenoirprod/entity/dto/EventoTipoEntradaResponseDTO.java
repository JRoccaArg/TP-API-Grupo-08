package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoTipoEntradaResponseDTO {

    private Integer id;

    private Integer eventoId;
    private String eventoTitulo;

    private Integer tipoEntradaId;
    private String tipoEntradaNombre;
    private String tipoEntradaDescripcion;

    private BigDecimal precio;
    private BigDecimal porcentajeDescuento;
    private BigDecimal precioFinal;

    private Integer cantidadTotal;
    private Integer cantidadDisponible;

    @JsonSerialize(using = FechaCatalogo.class)
    private LocalDateTime fechaInicioVenta;
    @JsonSerialize(using = FechaCatalogo.class)
    private LocalDateTime fechaFinVenta;

    private EstadoEventoTipoEntrada estado;
}
