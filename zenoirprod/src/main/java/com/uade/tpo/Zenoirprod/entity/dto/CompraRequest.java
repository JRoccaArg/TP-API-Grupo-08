package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class CompraRequest {
    private Integer usuarioId;
    private Integer carritoId;
    private List<ItemCompraRequest> items;

    @Data
    public static class ItemCompraRequest {
        private Integer eventoTipoEntradaId;
        private Integer cantidad;
        // Precio unitario ya con descuento aplicado. Se snapshotea en DetalleCompra.
        // Cuando exista el service de EventoTipoEntrada, se resuelve server-side
        // en vez de confiar en lo que manda el cliente.
        private BigDecimal precioUnitario;
    }
}
