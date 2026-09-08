package com.uade.tpo.Zenoirprod.entity.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraResponse {

    private Integer id;
    private Integer usuarioId;
    private String usuarioNombre;
    private Integer carritoId;
    private BigDecimal total;
    private EstadoCompra estado;
    private LocalDateTime fechaCompra;
    private LocalDateTime fechaCancelacion;
    private List<DetalleCompraResponse> detalles;

    public static CompraResponse fromEntity(Compra c) {
        if (c == null) return null;
        User u = c.getUsuario();
        return CompraResponse.builder()
                .id(c.getId())
                .usuarioId(u != null ? u.getId() : null)
                .usuarioNombre(u != null ? (u.getFirstName() + " " + u.getLastName()).trim() : null)
                .carritoId(c.getCarrito() != null ? c.getCarrito().getId() : null)
                .total(c.getTotal())
                .estado(c.getEstado())
                .fechaCompra(c.getFechaCompra())
                .fechaCancelacion(c.getFechaCancelacion())
                .detalles(c.getDetalles() == null ? List.of()
                        : c.getDetalles().stream().map(DetalleCompraResponse::fromEntity).toList())
                .build();
    }
}
