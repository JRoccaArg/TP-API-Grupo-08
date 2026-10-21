package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;

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
    // Para que el front muestre el evento (flyer, fecha y lugar) sin consultar cada entrada por separado
    private Integer eventoId;
    private String eventoTitulo;
    private String tipoEntradaNombre;
    private Integer cantidad;
    private BigDecimal precioOriginal;
    private BigDecimal porcentajeDescuento;
    // Mismo cálculo que la compra (PrecioCalculator): lo que se ve al pagar es lo que se cobra
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private LocalDateTime fechaAgregado;

    public static ItemCarritoResponse fromEntity(ItemCarrito i) {
        if (i == null) return null;
        EventoTipoEntrada ete = i.getEventoTipoEntrada();
        BigDecimal precioUnitario = ete != null
                ? PrecioCalculator.precioConDescuento(ete.getPrecio(), ete.getPorcentajeDescuento())
                : null;
        return ItemCarritoResponse.builder()
                .id(i.getId())
                .eventoTipoEntradaId(ete != null ? ete.getId() : null)
                .eventoId(ete != null && ete.getEvento() != null ? ete.getEvento().getId() : null)
                .eventoTitulo(ete != null && ete.getEvento() != null ? ete.getEvento().getTitulo() : null)
                .tipoEntradaNombre(ete != null && ete.getTipoEntrada() != null ? ete.getTipoEntrada().getNombre() : null)
                .cantidad(i.getCantidad())
                .precioOriginal(ete != null ? PrecioCalculator.normalizar(ete.getPrecio()) : null)
                .porcentajeDescuento(ete != null ? ete.getPorcentajeDescuento() : null)
                .precioUnitario(precioUnitario)
                .subtotal(precioUnitario != null ? PrecioCalculator.subtotal(precioUnitario, i.getCantidad()) : null)
                .fechaAgregado(i.getFechaAgregado())
                .build();
    }
}
