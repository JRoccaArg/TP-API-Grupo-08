package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Integer id;
    private String codigoQr;
    private EstadoTicket estado;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaUtilizacion;

    public static TicketResponse fromEntity(Ticket t) {
        if (t == null) return null;
        return TicketResponse.builder()
                .id(t.getId())
                .codigoQr(t.getCodigoQr())
                .estado(t.getEstado())
                .fechaEmision(t.getFechaEmision())
                .fechaUtilizacion(t.getFechaUtilizacion())
                .build();
    }
}
