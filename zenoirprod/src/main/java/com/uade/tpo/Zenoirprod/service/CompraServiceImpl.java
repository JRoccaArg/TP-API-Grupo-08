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
import com.uade.tpo.Zenoirprod.exceptions.PagoNoIniciadoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.CompraInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CompraNoCancelableException;
import com.uade.tpo.Zenoirprod.exceptions.DevolucionNoPermitidaException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;
import com.uade.tpo.Zenoirprod.exceptions.EventoFinalizadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class CompraServiceImpl implements CompraService {

    private static final String EVENTO_ACTIVO = "ACTIVO";

    private static final String EVENTO_CANCELADO = "CANCELADO";
    private static final String EVENTO_REPROGRAMADO = "REPROGRAMADO";

    @Autowired private CompraRepository compraRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CarritoRepository carritoRepository;
    @PersistenceContext private EntityManager entityManager;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Compra crearCompra(User usuario)
            throws CarritoActivoInexistenteException, CarritoVacioException, PagoNoIniciadoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            VentaNoHabilitadaException, EventoNoDisponibleException {

        LocalDateTime ahora = FechaCatalogo.ahora();

        // La compra sale siempre del carrito abierto del usuario autenticado: no se recibe nada del cliente.
        Carrito carrito = carritoRepository.findEnCursoForUpdate(usuario.getId())
                .orElseThrow(CarritoActivoInexistenteException::new);
        // Un carrito EN_PAGO vencido ya no tiene sus entradas apartadas (las libera el job de limpieza): no se paga.
        if (!carrito.estaVigente(ahora)) {
            throw new CarritoActivoInexistenteException();
        }
        if (carrito.getItems().isEmpty()) {
            throw new CarritoVacioException();
        }
        // Pagar es el paso siguiente a entrar a la pantalla de pago (iniciar el pago): ahi arranca el reloj de pago.
        if (carrito.getEstado() != EstadoCarrito.EN_PAGO) {
            throw new PagoNoIniciadoException();
        }

        List<DetalleCompra> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // El stock se bloquea siempre en el mismo orden para evitar deadlocks entre compras simultaneas.
        List<ItemCarrito> itemsOrdenados = new ArrayList<>(carrito.getItems());
        itemsOrdenados.sort(Comparator.comparing(item -> item.getEventoTipoEntrada().getId()));

        for (ItemCarrito item : itemsOrdenados) {
            EventoTipoEntrada ete = eventoTipoEntradaRepository.findByIdForUpdate(item.getEventoTipoEntrada().getId())
                    .orElseThrow(EventoTipoEntradaInexistenteException::new);

            validarVenta(ete, ahora);

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

            // El stock no se descuenta aca: ya quedo apartado cuando las entradas entraron al carrito.
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
        carrito.setFechaVencimiento(null);
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
    public Compra reembolsarEvento(Integer id, Integer eventoId)
            throws CompraInexistenteException, CompraNoCancelableException,
            DevolucionNoPermitidaException {

        Compra compra = compraRepository.findById(id)
                .orElseThrow(CompraInexistenteException::new);

        // El reembolso es de las entradas de UN evento de la compra: una compra puede mezclar eventos, y solo se reembolsan
        // los que se cancelaron o reprogramaron. Los demas eventos de la compra no se tocan.
        List<DetalleCompra> delEvento = compra.getDetalles().stream()
                .filter(detalle -> detalle.getEventoTipoEntrada().getEvento().getId().equals(eventoId))
                .toList();
        if (delEvento.isEmpty()) {
            throw new DevolucionNoPermitidaException("La compra no incluye entradas de ese evento");
        }
        String estadoEvento = delEvento.get(0).getEventoTipoEntrada().getEvento().getEstado();
        // La devolucion (reembolso) se permite solo si el evento fue cancelado o reprogramado.
        if (!EVENTO_CANCELADO.equalsIgnoreCase(estadoEvento) && !EVENTO_REPROGRAMADO.equalsIgnoreCase(estadoEvento)) {
            throw new DevolucionNoPermitidaException();
        }

        // Solo se reembolsan las entradas emitidas: una ya usada no se reembolsa nunca y una ya reembolsada no se repite.
        int reembolsadas = 0;
        for (DetalleCompra detalle : delEvento) {
            EventoTipoEntrada ete = bloquearOferta(detalle.getEventoTipoEntrada().getId())
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
                reembolsadas += aDevolver;
            }
        }
        if (reembolsadas == 0) {
            throw new CompraNoCancelableException();
        }

        // La compra solo pasa a CANCELADA cuando ya no le queda ninguna entrada sin reembolsar (ni una usada).
        boolean todasReembolsadas = compra.getDetalles().stream()
                .flatMap(detalle -> detalle.getTickets().stream())
                .allMatch(ticket -> ticket.getEstado() == EstadoTicket.CANCELADO);
        if (todasReembolsadas) {
            compra.setEstado(EstadoCompra.CANCELADA);
            compra.setFechaCancelacion(FechaCatalogo.ahora());
        }
        return compraRepository.save(compra);
    }

    // Bloquea la fila de la oferta y trae su stock actual. El refresh es necesario: la oferta ya viene cargada con
    // la compra, con el stock de antes de esperar el bloqueo. Sin refrescar, dos cancelaciones simultaneas se
    // pisan y se pierden devoluciones. Mismo criterio que CarritoServiceImpl.
    private Optional<EventoTipoEntrada> bloquearOferta(Integer id) {
        Optional<EventoTipoEntrada> oferta = eventoTipoEntradaRepository.findByIdForUpdate(id);
        oferta.ifPresent(entityManager::refresh);
        return oferta;
    }

    // El stock no se valida aca: las entradas del carrito ya estan reservadas. Una oferta AGOTADO es normal (puede
    // estar agotada justamente por esta reserva); lo que la bloquea es que el admin la pause o la finalice.
    private void validarVenta(EventoTipoEntrada ete, LocalDateTime ahora)
            throws EventoTipoEntradaNoDisponibleException, VentaNoHabilitadaException,
            EventoNoDisponibleException {

        if (!EVENTO_ACTIVO.equalsIgnoreCase(ete.getEvento().getEstado())) {
            throw new EventoNoDisponibleException();
        }
        if (ete.getEvento().haFinalizado(FechaCatalogo.ahora())) {
            throw new EventoFinalizadoException();
        }
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO
                && ete.getEstado() != EstadoEventoTipoEntrada.AGOTADO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }
        if (ete.getFechaInicioVenta() != null && ahora.isBefore(ete.getFechaInicioVenta())) {
            throw new VentaNoHabilitadaException();
        }
        if (ete.getFechaFinVenta() != null && ahora.isAfter(ete.getFechaFinVenta())) {
            throw new VentaNoHabilitadaException();
        }
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
