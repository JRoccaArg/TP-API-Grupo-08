package com.uade.tpo.Zenoirprod.entity.dto;

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
    }
}
