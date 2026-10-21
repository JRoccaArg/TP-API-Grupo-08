package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarritoResponse {

    private Integer id;
    private Integer usuarioId;
    private String usuarioNombre;
    private EstadoCarrito estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaVencimiento;
    private List<ItemCarritoResponse> items;
    private BigDecimal total;

    public static CarritoResponse fromEntity(Carrito c) {
        if (c == null) return null;
        User u = c.getUsuario();
        List<ItemCarritoResponse> items = c.getItems() == null ? List.of()
                : c.getItems().stream().map(ItemCarritoResponse::fromEntity).toList();
        BigDecimal total = items.stream()
                .map(ItemCarritoResponse::getSubtotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CarritoResponse.builder()
                .id(c.getId())
                .usuarioId(u != null ? u.getId() : null)
                .usuarioNombre(u != null ? (u.getFirstName() + " " + u.getLastName()).trim() : null)
                .estado(c.getEstado())
                .fechaCreacion(c.getFechaCreacion())
                .fechaActualizacion(c.getFechaActualizacion())
                .fechaVencimiento(c.getFechaVencimiento())
                .items(items)
                .total(PrecioCalculator.normalizar(total))
                .build();
    }
}
