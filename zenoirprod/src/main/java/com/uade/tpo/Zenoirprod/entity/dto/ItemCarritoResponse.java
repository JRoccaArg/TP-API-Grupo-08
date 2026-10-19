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
    // Para que el front pueda mostrar el evento (flyer, fecha y lugar) sin consultar cada entrada por separado.
    private Integer eventoId;
    private String eventoTitulo;
    private String tipoEntradaNombre;
    private Integer cantidad;
    // Precio de lista y porcentaje de descuento vigentes, por si la pantalla quiere mostrar el precio tachado.
    private BigDecimal precioOriginal;
    private BigDecimal porcentajeDescuento;
    // Precio de una entrada con el descuento vigente aplicado, y su subtotal. Se calculan con la misma formula que
    // la compra (PrecioCalculator), por eso lo que se muestra en la pantalla de pago es lo que se cobra.
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
