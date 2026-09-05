package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;

import lombok.Data;

@Data
public class EventoTipoEntradaRequest {

    private Integer eventoId;

    private Integer tipoEntradaId;

    private BigDecimal precio;

    private BigDecimal porcentajeDescuento;

    private Integer cantidadTotal;

    private LocalDateTime fechaInicioVenta;

    private LocalDateTime fechaFinVenta;

    private EstadoEventoTipoEntrada estado;
}
