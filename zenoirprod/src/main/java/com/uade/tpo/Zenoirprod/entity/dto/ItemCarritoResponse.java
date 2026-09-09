package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCarritoResponse {

    private Integer id;
    private Integer eventoTipoEntradaId;
    private String eventoTitulo;
    private String tipoEntradaNombre;
    private Integer cantidad;
    private LocalDateTime fechaAgregado;

    public static ItemCarritoResponse fromEntity(ItemCarrito i) {
        if (i == null) return null;
        EventoTipoEntrada ete = i.getEventoTipoEntrada();
        return ItemCarritoResponse.builder()
                .id(i.getId())
                .eventoTipoEntradaId(ete != null ? ete.getId() : null)
                .eventoTitulo(ete != null && ete.getEvento() != null ? ete.getEvento().getTitulo() : null)
                .tipoEntradaNombre(ete != null && ete.getTipoEntrada() != null ? ete.getTipoEntrada().getNombre() : null)
                .cantidad(i.getCantidad())
                .fechaAgregado(i.getFechaAgregado())
                .build();
    }
}
