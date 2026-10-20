package com.uade.tpo.Zenoirprod.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.dto.EstadisticasEventoResponse;
import com.uade.tpo.Zenoirprod.entity.dto.EstadisticasEventoResponse.PorEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.VentaPorEntrada;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;

@Service
public class EstadisticasServiceImpl implements EstadisticasService {

    @Autowired private EventosRepository eventosRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CompraRepository compraRepository;

    @Override
    public EstadisticasEventoResponse getEstadisticas(Integer eventoId) throws EventoInexistenteException {
        if (!eventosRepository.existsById(eventoId)) {
            throw new EventoInexistenteException();
        }
        // Ventas por entrada (solo compras confirmadas). Una entrada sin ventas no aparece en la consulta: queda en 0.
        Map<Integer, VentaPorEntrada> ventas = compraRepository.ventasPorEntrada(eventoId, EstadoCompra.CONFIRMADA)
                .stream().collect(Collectors.toMap(VentaPorEntrada::getEventoTipoEntradaId, Function.identity()));
        List<PorEntrada> porEntrada = eventoTipoEntradaRepository.findByEvento_IdOrderByIdAsc(eventoId).stream()
                .map(entrada -> armar(entrada, ventas.get(entrada.getId())))
                .toList();

        return EstadisticasEventoResponse.builder()
                .eventoId(eventoId)
                .vendidas(porEntrada.stream().mapToLong(PorEntrada::getVendidas).sum())
                .cupoTotal(porEntrada.stream().mapToLong(PorEntrada::getCupo).sum())
                .recaudado(porEntrada.stream().map(PorEntrada::getRecaudado).reduce(BigDecimal.ZERO, BigDecimal::add))
                .compras(compraRepository.contarCompras(eventoId, EstadoCompra.CONFIRMADA))
                .ingresados(compraRepository.contarTickets(eventoId, EstadoTicket.UTILIZADO))
                .porEntrada(porEntrada)
                .build();
    }

    private PorEntrada armar(EventoTipoEntrada entrada, VentaPorEntrada venta) {
        return PorEntrada.builder()
                .eventoTipoEntradaId(entrada.getId())
                .tipoEntradaNombre(entrada.getTipoEntrada().getNombre())
                .estado(entrada.getEstado().name())
                .cupo(entrada.getCantidadTotal())
                .disponibles(entrada.getCantidadDisponible())
                .vendidas(venta == null ? 0 : venta.getVendidas())
                .recaudado(venta == null ? BigDecimal.ZERO : venta.getRecaudado())
                .build();
    }
}
