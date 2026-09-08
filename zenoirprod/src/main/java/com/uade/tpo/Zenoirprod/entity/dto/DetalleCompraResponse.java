package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.util.List;

import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCompraResponse {

    private Integer id;
    private Integer eventoTipoEntradaId;
    private String eventoTitulo;
    private String tipoEntradaNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private List<TicketResponse> tickets;

    public static DetalleCompraResponse fromEntity(DetalleCompra d) {
        if (d == null) return null;
        EventoTipoEntrada ete = d.getEventoTipoEntrada();
        return DetalleCompraResponse.builder()
                .id(d.getId())
                .eventoTipoEntradaId(ete != null ? ete.getId() : null)
                .eventoTitulo(ete != null && ete.getEvento() != null ? ete.getEvento().getTitulo() : null)
                .tipoEntradaNombre(ete != null && ete.getTipoEntrada() != null ? ete.getTipoEntrada().getNombre() : null)
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotal(d.getSubtotal())
                .tickets(d.getTickets() == null ? List.of()
                        : d.getTickets().stream().map(TicketResponse::fromEntity).toList())
                .build();
    }
}
