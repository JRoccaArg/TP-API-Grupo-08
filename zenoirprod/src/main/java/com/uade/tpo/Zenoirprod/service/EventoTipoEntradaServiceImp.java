package com.uade.tpo.Zenoirprod.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaRequest;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;

@Service
public class EventoTipoEntradaServiceImp implements EventoTipoEntradaService {

    @Autowired
    private EventoTipoEntradaRepository eventoTipoEntradaRepository;

    @Autowired
    private EventosService eventosService;

    @Autowired
    private TipoEntradaService tipoEntradaService;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Override
    public EventoTipoEntrada getPorId(Integer id) throws EventoTipoEntradaInexistenteException {
        if (id == null) {
            throw new EventoTipoEntradaInexistenteException();
        }
        return eventoTipoEntradaRepository.findById(id)
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
    }

    @Override
    public Page<EventoTipoEntrada> getPorEvento(Integer eventoId, PageRequest pageRequest)
            throws EventoInexistenteException {
        if (eventoId == null) {
            throw new EventoInexistenteException();
        }
        eventosService.getEventoPorId(eventoId);
        return eventoTipoEntradaRepository.findByEvento_Id(eventoId, pageRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EventoTipoEntrada crear(EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInvalidoException, EventoTipoEntradaDuplicadoException,
            EventoInexistenteException, TipoEntradaInexistenteException {

        validarRequestCreacion(request);

        Evento evento = eventosService.getEventoPorId(request.getEventoId())
                .orElseThrow(EventoInexistenteException::new);
        TipoEntrada tipoEntrada = tipoEntradaService.getTipoEntradaPorId(request.getTipoEntradaId());

        if (Boolean.FALSE.equals(tipoEntrada.getActivo())) {
            throw new EventoTipoEntradaInvalidoException();
        }

        if (eventoTipoEntradaRepository.existsByEvento_IdAndTipoEntrada_Id(
                request.getEventoId(), request.getTipoEntradaId())) {
            throw new EventoTipoEntradaDuplicadoException();
        }

        EventoTipoEntrada entrada = new EventoTipoEntrada();
        entrada.setEvento(evento);
        entrada.setTipoEntrada(tipoEntrada);
        entrada.setPrecio(PrecioCalculator.normalizar(request.getPrecio()));
        entrada.setPorcentajeDescuento(normalizarDescuento(request.getPorcentajeDescuento()));
        entrada.setCantidadTotal(request.getCantidadTotal());
        entrada.setCantidadDisponible(request.getCantidadTotal());
        entrada.setFechaInicioVenta(request.getFechaInicioVenta());
        entrada.setFechaFinVenta(request.getFechaFinVenta());
        entrada.setEstado(request.getEstado() != null ? request.getEstado() : EstadoEventoTipoEntrada.ACTIVO);

        return eventoTipoEntradaRepository.save(entrada);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EventoTipoEntrada actualizar(Integer id, EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException {

        if (request == null) {
            throw new EventoTipoEntradaInvalidoException();
        }

        EventoTipoEntrada entrada = getPorId(id);

        if (request.getPrecio() != null) {
            if (request.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
                throw new EventoTipoEntradaInvalidoException();
            }
            entrada.setPrecio(PrecioCalculator.normalizar(request.getPrecio()));
        }

        if (request.getPorcentajeDescuento() != null) {
            validarDescuento(request.getPorcentajeDescuento());
            entrada.setPorcentajeDescuento(PrecioCalculator.normalizar(request.getPorcentajeDescuento()));
        }

        if (request.getCantidadTotal() != null) {
            if (request.getCantidadTotal() <= 0) {
                throw new EventoTipoEntradaInvalidoException();
            }

            int cantidadVendida = entrada.getCantidadTotal() - entrada.getCantidadDisponible();
            if (request.getCantidadTotal() < cantidadVendida) {
                throw new EventoTipoEntradaInvalidoException();
            }

            entrada.setCantidadTotal(request.getCantidadTotal());
            entrada.setCantidadDisponible(request.getCantidadTotal() - cantidadVendida);

            if (entrada.getCantidadDisponible() > 0 && entrada.getEstado() == EstadoEventoTipoEntrada.AGOTADO) {
                entrada.setEstado(EstadoEventoTipoEntrada.ACTIVO);
            }
        }

        LocalDateTime inicioFinal = request.getFechaInicioVenta() != null
                ? request.getFechaInicioVenta()
                : entrada.getFechaInicioVenta();
        LocalDateTime finFinal = request.getFechaFinVenta() != null
                ? request.getFechaFinVenta()
                : entrada.getFechaFinVenta();

        if (request.getFechaInicioVenta() != null || request.getFechaFinVenta() != null) {
            validarFechas(inicioFinal, finFinal);
            entrada.setFechaInicioVenta(inicioFinal);
            entrada.setFechaFinVenta(finFinal);
        }

        if (request.getEstado() != null) {
            // El estado no puede contradecir el stock real de la entrada.
            if (request.getEstado() == EstadoEventoTipoEntrada.ACTIVO
                    && entrada.getCantidadDisponible() == 0) {
                throw new EventoTipoEntradaInvalidoException();
            }
            if (request.getEstado() == EstadoEventoTipoEntrada.AGOTADO
                    && entrada.getCantidadDisponible() > 0) {
                throw new EventoTipoEntradaInvalidoException();
            }
            entrada.setEstado(request.getEstado());
        }

        return eventoTipoEntradaRepository.save(entrada);
    }

    @Override
    public void eliminar(Integer id)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaEnUsoException {
        EventoTipoEntrada entrada = getPorId(id);
        if (carritoRepository.existsByItems_EventoTipoEntrada_Id(id)
                || compraRepository.existsByDetalles_EventoTipoEntrada_Id(id)) {
            throw new EventoTipoEntradaEnUsoException();
        }
        eventoTipoEntradaRepository.delete(entrada);
    }

    @Override
    public BigDecimal getPrecioFinal(Integer id) throws EventoTipoEntradaInexistenteException {
        EventoTipoEntrada entrada = getPorId(id);
        BigDecimal porcentaje = entrada.getPorcentajeDescuento() != null
                ? entrada.getPorcentajeDescuento()
                : BigDecimal.ZERO;

        // Delegado en PrecioCalculator para que el catalogo y la compra usen
        // exactamente la misma formula y el mismo redondeo.
        return PrecioCalculator.precioConDescuento(entrada.getPrecio(), porcentaje);
    }

    @Override
    public boolean hayDisponibilidad(Integer id, Integer cantidad) throws EventoTipoEntradaInexistenteException {
        if (cantidad == null || cantidad <= 0) {
            return false;
        }

        EventoTipoEntrada entrada = getPorId(id);
        LocalDateTime ahora = LocalDateTime.now();

        boolean entradaActiva = entrada.getEstado() == EstadoEventoTipoEntrada.ACTIVO;
        boolean eventoActivo = "ACTIVO".equalsIgnoreCase(entrada.getEvento().getEstado());
        boolean hayStock = entrada.getCantidadDisponible() >= cantidad;

        return ventaEnFecha(entrada, ahora) && entradaActiva && eventoActivo && hayStock;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void descontarStock(Integer id, Integer cantidad)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException, StockInsuficienteException {

        if (cantidad == null || cantidad <= 0) {
            throw new EventoTipoEntradaInvalidoException();
        }

        EventoTipoEntrada entrada = eventoTipoEntradaRepository.findByIdForUpdate(id)
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        LocalDateTime ahora = LocalDateTime.now();

        boolean entradaActiva = entrada.getEstado() == EstadoEventoTipoEntrada.ACTIVO;
        boolean eventoActivo = "ACTIVO".equalsIgnoreCase(entrada.getEvento().getEstado());

        if (!ventaEnFecha(entrada, ahora) || !entradaActiva || !eventoActivo) {
            throw new EventoTipoEntradaInvalidoException();
        }

        if (entrada.getCantidadDisponible() < cantidad) {
            throw new StockInsuficienteException();
        }

        entrada.setCantidadDisponible(entrada.getCantidadDisponible() - cantidad);
        if (entrada.getCantidadDisponible() == 0) {
            entrada.setEstado(EstadoEventoTipoEntrada.AGOTADO);
        }
        eventoTipoEntradaRepository.save(entrada);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reponerStock(Integer id, Integer cantidad)
            throws EventoTipoEntradaInexistenteException, EventoTipoEntradaInvalidoException {

        if (cantidad == null || cantidad <= 0) {
            throw new EventoTipoEntradaInvalidoException();
        }

        EventoTipoEntrada entrada = eventoTipoEntradaRepository.findByIdForUpdate(id)
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        int nuevoDisponible = entrada.getCantidadDisponible() + cantidad;

        if (nuevoDisponible > entrada.getCantidadTotal()) {
            throw new EventoTipoEntradaInvalidoException();
        }

        entrada.setCantidadDisponible(nuevoDisponible);
        if (entrada.getEstado() == EstadoEventoTipoEntrada.AGOTADO && nuevoDisponible > 0) {
            entrada.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        }
        eventoTipoEntradaRepository.save(entrada);
    }

    // Una fecha de inicio/fin nula significa "sin restricción" en ese extremo,
    // igual que en CompraServiceImpl. Evita NPE si la entrada quedara sin fechas.
    private boolean ventaEnFecha(EventoTipoEntrada entrada, LocalDateTime ahora) {
        boolean inicioOk = entrada.getFechaInicioVenta() == null
                || !ahora.isBefore(entrada.getFechaInicioVenta());
        boolean finOk = entrada.getFechaFinVenta() == null
                || !ahora.isAfter(entrada.getFechaFinVenta());
        return inicioOk && finOk;
    }

    private void validarRequestCreacion(EventoTipoEntradaRequest request)
            throws EventoTipoEntradaInvalidoException {
        if (request == null
                || request.getEventoId() == null
                || request.getTipoEntradaId() == null
                || request.getPrecio() == null
                || request.getPrecio().compareTo(BigDecimal.ZERO) <= 0
                || request.getCantidadTotal() == null
                || request.getCantidadTotal() <= 0) {
            throw new EventoTipoEntradaInvalidoException();
        }

        validarDescuento(request.getPorcentajeDescuento());
        validarFechas(request.getFechaInicioVenta(), request.getFechaFinVenta());
    }

    private void validarDescuento(BigDecimal porcentaje) throws EventoTipoEntradaInvalidoException {
        if (porcentaje != null
                && (porcentaje.compareTo(BigDecimal.ZERO) < 0
                || porcentaje.compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new EventoTipoEntradaInvalidoException();
        }
    }

    private void validarFechas(LocalDateTime inicio, LocalDateTime fin)
            throws EventoTipoEntradaInvalidoException {
        if (inicio == null || fin == null || !fin.isAfter(inicio)) {
            throw new EventoTipoEntradaInvalidoException();
        }
    }

    private BigDecimal normalizarDescuento(BigDecimal porcentaje) throws EventoTipoEntradaInvalidoException {
        validarDescuento(porcentaje);
        return porcentaje == null
                ? BigDecimal.ZERO.setScale(PrecioCalculator.ESCALA)
                : PrecioCalculator.normalizar(porcentaje);
    }
}
