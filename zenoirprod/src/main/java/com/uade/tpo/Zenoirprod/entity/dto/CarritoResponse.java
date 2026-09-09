package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.User;

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
    private List<ItemCarritoResponse> items;

    public static CarritoResponse fromEntity(Carrito c) {
        if (c == null) return null;
        User u = c.getUsuario();
        return CarritoResponse.builder()
                .id(c.getId())
                .usuarioId(u != null ? u.getId() : null)
                .usuarioNombre(u != null ? (u.getFirstName() + " " + u.getLastName()).trim() : null)
                .estado(c.getEstado())
                .fechaCreacion(c.getFechaCreacion())
                .fechaActualizacion(c.getFechaActualizacion())
                .items(c.getItems() == null ? List.of()
                        : c.getItems().stream().map(ItemCarritoResponse::fromEntity).toList())
                .build();
    }
}
