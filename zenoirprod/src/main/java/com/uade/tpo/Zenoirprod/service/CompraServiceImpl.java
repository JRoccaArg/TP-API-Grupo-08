package com.uade.tpo.Zenoirprod.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest;
import com.uade.tpo.Zenoirprod.entity.dto.CompraRequest.ItemCompraRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoAjenoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@Service
public class CompraServiceImpl implements CompraService {

    private static final BigDecimal CIEN = BigDecimal.valueOf(100);

    /** Estado en el que tiene que estar un evento para poder venderle entradas. */
    private static final String EVENTO_ACTIVO = "ACTIVO";

    @Autowired private CompraRepository compraRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CarritoRepository carritoRepository;

    /**
     * rollbackFor = Exception.class es obligatorio: por defecto Spring solo
     * revierte ante RuntimeException. Como todas las excepciones de negocio de
     * este service son checked, sin esto una compra que falla en el item N
     * dejaba commiteado el descuento de stock de los items 1..N-1.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Compra crearCompra(CompraRequest request)
            throws CompraInvalidaException, UsuarioInexistenteException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException, VentaNoHabilitadaException, EventoNoDisponibleException,
            CarritoInexistenteException, CarritoAjenoException {

        validarShape(request);

        User usuario = userRepository.findById(request.getUsuarioId())
                .orElseThrow(UsuarioInexistenteException::new);

        Carrito carrito = resolverCarrito(request.getCarritoId(), usuario);

        List<DetalleCompra> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        LocalDateTime ahora = LocalDateTime.now();

        for (ItemCompraRequest item : request.getItems()) {
            EventoTipoEntrada ete = eventoTipoEntradaRepository.findById(item.getEventoTipoEntradaId())
                    .orElseThrow(EventoTipoEntradaInexistenteException::new);

            validarDisponibilidad(ete, item.getCantidad(), ahora);

            BigDecimal precioUnitario = calcularPrecioConDescuento(ete);
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()))
                    .setScale(2, RoundingMode.HALF_UP);

            DetalleCompra detalle = new DetalleCompra();
            detalle.setEventoTipoEntrada(ete);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);
            detalle.setTickets(generarTickets(item.getCantidad(), ahora));
            detalles.add(detalle);

            ete.setCantidadDisponible(ete.getCantidadDisponible() - item.getCantidad());
            eventoTipoEntradaRepository.save(ete);

            total = total.add(subtotal);
        }

        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setCarrito(carrito);
        compra.setTotal(total);
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(ahora);
        compra.setDetalles(detalles);

        Compra guardada = compraRepository.save(compra);

        // El carrito que dio origen a la compra queda cerrado.
        if (carrito != null) {
            carrito.setEstado(EstadoCarrito.CONVERTIDO);
            carrito.setFechaActualizacion(ahora);
            carritoRepository.save(carrito);
        }

        return guardada;
    }

    @Override
    public Optional<Compra> getPorId(Integer id) {
        return compraRepository.findById(id);
    }

    @Override
    public List<Compra> getPorUsuario(Integer usuarioId) {
        return compraRepository.findByUsuario_IdOrderByFechaCompraDesc(usuarioId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Compra cancelar(Integer id) throws CompraInexistenteException, CompraNoCancelableException {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(CompraInexistenteException::new);
        if (compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new CompraNoCancelableException();
        }

        for (DetalleCompra detalle : compra.getDetalles()) {
            EventoTipoEntrada ete = detalle.getEventoTipoEntrada();
            ete.setCantidadDisponible(ete.getCantidadDisponible() + detalle.getCantidad());
            eventoTipoEntradaRepository.save(ete);

            for (Ticket ticket : detalle.getTickets()) {
                if (ticket.getEstado() == EstadoTicket.EMITIDO) {
                    ticket.setEstado(EstadoTicket.CANCELADO);
                }
            }
        }

        compra.setEstado(EstadoCompra.CANCELADA);
        compra.setFechaCancelacion(LocalDateTime.now());
        return compraRepository.save(compra);
    }

    /** Resuelve y valida el carrito opcional del request. */
    private Carrito resolverCarrito(Integer carritoId, User usuario)
            throws CarritoInexistenteException, CarritoAjenoException {
        if (carritoId == null) {
            return null;
        }
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        if (!carrito.getUsuario().getId().equals(usuario.getId())) {
            throw new CarritoAjenoException();
        }
        return carrito;
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

    private void validarShape(CompraRequest request) throws CompraInvalidaException {
        if (request.getUsuarioId() == null) throw new CompraInvalidaException();
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new CompraInvalidaException();
        }
        for (ItemCompraRequest item : request.getItems()) {
            if (item.getEventoTipoEntradaId() == null) throw new CompraInvalidaException();
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new CompraInvalidaException();
            }
        }
    }

    private BigDecimal calcularPrecioConDescuento(EventoTipoEntrada ete) {
        BigDecimal precio = ete.getPrecio();
        BigDecimal descuento = ete.getPorcentajeDescuento();
        if (descuento == null || descuento.compareTo(BigDecimal.ZERO) <= 0) {
            return precio.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal factor = BigDecimal.ONE.subtract(descuento.divide(CIEN, 4, RoundingMode.HALF_UP));
        return precio.multiply(factor).setScale(2, RoundingMode.HALF_UP);
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
