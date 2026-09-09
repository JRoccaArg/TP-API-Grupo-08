package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.Locacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoResponse {

    private Integer id;
    private String titulo;
    private String descripcion;
    private String estado;

    private Integer locacionId;
    private String locacionNombre;
    private String locacionDireccion;

    private Integer categoriaId;
    private String categoriaNombre;

    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraFin;

    public static EventoResponse fromEntity(Evento e) {
        if (e == null) return null;
        Locacion l = e.getLocacion();
        Category c = e.getCategoria();
        return EventoResponse.builder()
                .id(e.getId())
                .titulo(e.getTitulo())
                .descripcion(e.getDescripcion())
                .estado(e.getEstado())
                .locacionId(l != null ? l.getId() : null)
                .locacionNombre(l != null ? l.getNombre() : null)
                .locacionDireccion(l != null ? l.getDireccion() : null)
                .categoriaId(c != null ? c.getId() : null)
                .categoriaNombre(c != null ? c.getNombre() : null)
                .fechaHoraInicio(e.getFechaHoraInicio())
                .fechaHoraFin(e.getFechaHoraFin())
                .build();
    }
}
