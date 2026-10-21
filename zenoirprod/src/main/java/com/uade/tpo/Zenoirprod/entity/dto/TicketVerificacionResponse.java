package com.uade.tpo.Zenoirprod.entity.dto;

import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Lo que ve el organizador al escanear un QR: el ticket, a quién pertenece y a qué evento da acceso
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketVerificacionResponse {

    private Integer id;
    private String codigoQr;
    private EstadoTicket estado;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaUtilizacion;
    private String compradorNombre;
    private Integer eventoId;
    private String eventoTitulo;
    private LocalDateTime eventoFechaHoraInicio;
    private LocalDateTime eventoFechaHoraFin;
    private String locacionNombre;
    private String tipoEntradaNombre;

    // Busca en la compra el ticket con ese código y arma la respuesta; null si no está
    public static TicketVerificacionResponse fromCompra(Compra compra, String codigoQr) {
        for (DetalleCompra detalle : compra.getDetalles()) {
            for (Ticket ticket : detalle.getTickets()) {
                if (ticket.getCodigoQr().equals(codigoQr)) {
                    return armar(compra.getUsuario(), detalle, ticket);
                }
            }
        }
        return null;
    }

    private static TicketVerificacionResponse armar(User comprador, DetalleCompra detalle, Ticket ticket) {
        Evento evento = detalle.getEventoTipoEntrada().getEvento();
        return TicketVerificacionResponse.builder()
                .id(ticket.getId())
                .codigoQr(ticket.getCodigoQr())
                .estado(ticket.getEstado())
                .fechaEmision(ticket.getFechaEmision())
                .fechaUtilizacion(ticket.getFechaUtilizacion())
                .compradorNombre(comprador.getFirstName() + " " + comprador.getLastName())
                .eventoId(evento.getId())
                .eventoTitulo(evento.getTitulo())
                .eventoFechaHoraInicio(evento.getFechaHoraInicio())
                .eventoFechaHoraFin(evento.getFechaHoraFin())
                .locacionNombre(evento.getLocacion().getNombre())
                .tipoEntradaNombre(detalle.getEventoTipoEntrada().getTipoEntrada().getNombre())
                .build();
    }
}
