package com.uade.tpo.Zenoirprod.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.DevolucionNoPermitidaException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;

@Service
public class CompraServiceImpl implements CompraService {

    private static final String EVENTO_ACTIVO = "ACTIVO";

    private static final String EVENTO_CANCELADO = "CANCELADO";

    @Autowired private CompraRepository compraRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CarritoRepository carritoRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Compra crearCompra(User usuario)
            throws CarritoActivoInexistenteException, CarritoVacioException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException, VentaNoHabilitadaException, EventoNoDisponibleException {

        // La compra sale siempre del carrito activo del usuario autenticado: no se recibe nada del cliente.
        Carrito carrito = carritoRepository.findByUsuarioIdAndEstadoForUpdate(usuario.getId(), EstadoCarrito.ACTIVO)
                .orElseThrow(CarritoActivoInexistenteException::new);
        if (carrito.getItems().isEmpty()) {
            throw new CarritoVacioException();
        }

        List<DetalleCompra> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        LocalDateTime ahora = LocalDateTime.now();

        // El stock se bloquea siempre en el mismo orden para evitar deadlocks entre compras simultaneas.
        List<ItemCarrito> itemsOrdenados = new ArrayList<>(carrito.getItems());
        itemsOrdenados.sort(Comparator.comparing(item -> item.getEventoTipoEntrada().getId()));

        for (ItemCarrito item : itemsOrdenados) {
            EventoTipoEntrada ete = eventoTipoEntradaRepository.findByIdForUpdate(item.getEventoTipoEntrada().getId())
                    .orElseThrow(EventoTipoEntradaInexistenteException::new);

            validarDisponibilidad(ete, item.getCantidad(), ahora);

            BigDecimal precioUnitario =
                    PrecioCalculator.precioConDescuento(ete.getPrecio(), ete.getPorcentajeDescuento());
            BigDecimal subtotal = PrecioCalculator.subtotal(precioUnitario, item.getCantidad());

            DetalleCompra detalle = new DetalleCompra();
            detalle.setEventoTipoEntrada(ete);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);
            detalle.setTickets(generarTickets(item.getCantidad(), ahora));
            detalles.add(detalle);

            descontarStock(ete, item.getCantidad());

            total = total.add(subtotal);
        }

        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setCarrito(carrito);
        compra.setTotal(PrecioCalculator.normalizar(total));
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(ahora);
        compra.setDetalles(detalles);

        Compra guardada = compraRepository.save(compra);

        carrito.setEstado(EstadoCarrito.CONVERTIDO);
        carrito.setFechaActualizacion(ahora);
        carritoRepository.save(carrito);

        return guardada;
    }

    @Override
    public Optional<Compra> getPorId(Integer id) {
        return compraRepository.findById(id);
    }

    @Override
    public Page<Compra> getPorUsuario(Integer usuarioId, PageRequest pageRequest) {
        return compraRepository.findByUsuario_IdOrderByFechaCompraDesc(usuarioId, pageRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Compra cancelar(Integer id)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException {

        Compra compra = compraRepository.findById(id)
                .orElseThrow(CompraInexistenteException::new);
        if (compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new CompraNoCancelableException();
        }

        for (DetalleCompra detalle : compra.getDetalles()) {
            String estadoEvento = detalle.getEventoTipoEntrada().getEvento().getEstado();
            if (!EVENTO_CANCELADO.equalsIgnoreCase(estadoEvento)) {
                throw new DevolucionNoPermitidaException();
            }
        }

        for (DetalleCompra detalle : compra.getDetalles()) {
            EventoTipoEntrada ete = eventoTipoEntradaRepository
                    .findByIdForUpdate(detalle.getEventoTipoEntrada().getId())
                    .orElseThrow(CompraNoCancelableException::new);

            int aDevolver = 0;
            for (Ticket ticket : detalle.getTickets()) {
                if (ticket.getEstado() == EstadoTicket.EMITIDO) {
                    aDevolver++;
                    ticket.setEstado(EstadoTicket.CANCELADO);
                }
            }
            if (aDevolver > 0) {
                devolverStock(ete, aDevolver);
            }
        }

        compra.setEstado(EstadoCompra.CANCELADA);
        compra.setFechaCancelacion(LocalDateTime.now());
        return compraRepository.save(compra);
    }

    private void validarDisponibilidad(EventoTipoEntrada ete, int cantidad, LocalDateTime ahora)
            throws EventoTipoEntradaNoDisponibleException, VentaNoHabilitadaException,
            EventoNoDisponibleException, StockInsuficienteException {

        if (!EVENTO_ACTIVO.equalsIgnoreCase(ete.getEvento().getEstado())) {
            throw new EventoNoDisponibleException();
        }
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }
        if (ete.getFechaInicioVenta() != null && ahora.isBefore(ete.getFechaInicioVenta())) {
            throw new VentaNoHabilitadaException();
        }
        if (ete.getFechaFinVenta() != null && ahora.isAfter(ete.getFechaFinVenta())) {
            throw new VentaNoHabilitadaException();
        }
        if (ete.getCantidadDisponible() < cantidad) {
            throw new StockInsuficienteException();
        }
    }

    private void descontarStock(EventoTipoEntrada ete, int cantidad) {
        int restante = ete.getCantidadDisponible() - cantidad;
        ete.setCantidadDisponible(restante);
        if (restante == 0) {
            ete.setEstado(EstadoEventoTipoEntrada.AGOTADO);
        }
        eventoTipoEntradaRepository.save(ete);
    }

    private void devolverStock(EventoTipoEntrada ete, int cantidad) {
        ete.setCantidadDisponible(ete.getCantidadDisponible() + cantidad);
        if (ete.getEstado() == EstadoEventoTipoEntrada.AGOTADO && ete.getCantidadDisponible() > 0) {
            ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        }
        eventoTipoEntradaRepository.save(ete);
    }

    private List<Ticket> generarTickets(int cantidad, LocalDateTime fechaEmision) {
        List<Ticket> tickets = new ArrayList<>(cantidad);
        for (int i = 0; i < cantidad; i++) {
            Ticket ticket = new Ticket();
            ticket.setCodigoQr(UUID.randomUUID().toString());
            ticket.setEstado(EstadoTicket.EMITIDO);
            ticket.setFechaEmision(fechaEmision);
            tickets.add(ticket);
        }
        return tickets;
    }
}
