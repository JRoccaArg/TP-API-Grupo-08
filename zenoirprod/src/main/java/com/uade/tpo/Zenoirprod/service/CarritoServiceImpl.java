package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoActivoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoVacioException;
import com.uade.tpo.Zenoirprod.exceptions.EventoNoDisponibleException;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;
import com.uade.tpo.Zenoirprod.exceptions.EventoFinalizadoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.VentaNoHabilitadaException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

// Reserva de stock: las entradas de un carrito abierto ya están descontadas de cantidadDisponible. Se apartan al agregarlas
// y se devuelven si el usuario las quita, vacía o abandona el carrito, o si se vence el tiempo. Pagar no vuelve a descontar.
//   ACTIVO   -> está armando el carrito. Reloj de armado: primera entrada + 15 min, no se renueva al agregar más.
//   EN_PAGO  -> entró a la pantalla de pago. Reloj de pago nuevo: ese momento + 15 min. Puede seguir modificando el carrito.
//   CONVERTIDO / ABANDONADO -> terminales. Al abandonar o vencer se devuelven las entradas y se vacían los items.
// Orden de bloqueos, siempre el mismo para evitar deadlocks entre pedidos simultáneos:
//   usuario -> carrito -> ofertas (EventoTipoEntrada) ordenadas por id.
@Service
public class CarritoServiceImpl implements CarritoService {

    private static final String EVENTO_ACTIVO = "ACTIVO";

    @Autowired private CarritoRepository carritoRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private UserRepository userRepository;
    @PersistenceContext private EntityManager entityManager;

    @Value("${carrito.armado-minutos:15}")
    private long armadoMinutos;

    @Value("${carrito.pago-minutos:15}")
    private long pagoMinutos;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito obtenerOCrearActivo(User usuario) {
        // Se bloquea al usuario para que dos pedidos simultáneos no creen dos carritos abiertos
        User bloqueado = userRepository.findByIdForUpdate(usuario.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        LocalDateTime ahora = FechaCatalogo.ahora();

        Optional<Carrito> existente = carritoRepository.findEnCursoForUpdate(bloqueado.getId());
        if (existente.isPresent()) {
            if (existente.get().estaVigente(ahora)) {
                return existente.get();
            }
            // Se le venció el tiempo y el job todavía no lo liberó: se libera ahora y empieza uno nuevo
            abandonarYLiberar(existente.get(), ahora);
        }

        Carrito carrito = new Carrito();
        carrito.setUsuario(bloqueado);
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaCreacion(ahora);
        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    public Page<Carrito> getPorUsuario(Integer usuarioId, PageRequest pageRequest) {
        return carritoRepository.findByUsuario_IdOrderByFechaCreacionDesc(usuarioId, pageRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito agregarItem(User usuario, ItemCarritoRequest request)
            throws ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException {

        if (request.getEventoTipoEntradaId() == null
                || request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        // El primer item crea el carrito; si algo falla más abajo se revierte todo
        Carrito carrito = obtenerOCrearActivo(usuario);

        EventoTipoEntrada ete = bloquearOferta(request.getEventoTipoEntradaId())
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        LocalDateTime ahora = FechaCatalogo.ahora();

        // Solo la cantidad nueva necesita stock: lo que ya estaba en el carrito está apartado
        validarVendible(ete, request.getCantidad(), ahora);
        reservar(ete, request.getCantidad());

        Optional<ItemCarrito> itemExistente = carrito.getItems().stream()
                .filter(item -> item.getEventoTipoEntrada().getId().equals(ete.getId()))
                .findFirst();
        if (itemExistente.isPresent()) {
            itemExistente.get().setCantidad(itemExistente.get().getCantidad() + request.getCantidad());
            itemExistente.get().setFechaAgregado(ahora);
        } else {
            ItemCarrito item = new ItemCarrito();
            item.setEventoTipoEntrada(ete);
            item.setCantidad(request.getCantidad());
            item.setFechaAgregado(ahora);
            carrito.getItems().add(item);
        }

        // La primera entrada arranca el reloj de armado (las siguientes no lo renuevan); un carrito EN_PAGO conserva su reloj de pago
        if (carrito.getFechaVencimiento() == null) {
            carrito.setFechaVencimiento(ahora.plusMinutes(armadoMinutos));
        }

        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito actualizarCantidad(Integer usuarioId, Integer itemId, Integer cantidad)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException {

        if (cantidad == null || cantidad <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        Carrito carrito = carritoAbiertoBloqueado(usuarioId);
        ItemCarrito item = buscarItem(carrito, itemId);
        LocalDateTime ahora = FechaCatalogo.ahora();

        int diferencia = cantidad - item.getCantidad();
        if (diferencia != 0) {
            EventoTipoEntrada ete = bloquearOferta(item.getEventoTipoEntrada().getId())
                    .orElseThrow(EventoTipoEntradaInexistenteException::new);
            if (diferencia > 0) {
                validarVendible(ete, diferencia, ahora);
                reservar(ete, diferencia);
            } else {
                devolver(ete, -diferencia);
            }
            item.setCantidad(cantidad);
        }

        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito quitarItem(Integer usuarioId, Integer itemId)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException {
        Carrito carrito = carritoAbiertoBloqueado(usuarioId);

        ItemCarrito item = buscarItem(carrito, itemId);
        devolverItem(item);
        carrito.getItems().remove(item);
        if (carrito.getItems().isEmpty()) {
            volverAActivo(carrito);
        }
        carrito.setFechaActualizacion(FechaCatalogo.ahora());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito vaciar(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoAbiertoBloqueado(usuarioId);

        devolverItems(carrito);
        carrito.getItems().clear();
        volverAActivo(carrito);
        carrito.setFechaActualizacion(FechaCatalogo.ahora());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito abandonar(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoAbiertoBloqueado(usuarioId);

        abandonarYLiberar(carrito, FechaCatalogo.ahora());
        return carrito;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito iniciarPago(Integer usuarioId)
            throws CarritoActivoInexistenteException, CarritoVacioException,
            EventoTipoEntradaNoDisponibleException, EventoNoDisponibleException, VentaNoHabilitadaException {

        Carrito carrito = carritoAbiertoBloqueado(usuarioId);
        // Ya estaba en la pantalla de pago: no se reinicia el reloj, así nadie retiene entradas entrando a pagar una y otra vez
        if (carrito.getEstado() == EstadoCarrito.EN_PAGO) {
            return carrito;
        }
        if (carrito.getItems().isEmpty()) {
            throw new CarritoVacioException();
        }

        LocalDateTime ahora = FechaCatalogo.ahora();
        // Las entradas ya están apartadas: solo se avisa ahora si el admin pausó la oferta o canceló el evento
        for (ItemCarrito item : carrito.getItems()) {
            validarVenta(item.getEventoTipoEntrada(), ahora);
        }

        carrito.setEstado(EstadoCarrito.EN_PAGO);
        carrito.setFechaVencimiento(ahora.plusMinutes(pagoMinutos));
        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void abandonarSiVencido(Integer carritoId) {
        LocalDateTime ahora = FechaCatalogo.ahora();
        // Se vuelve a mirar el estado con el carrito ya bloqueado: pudo pagarse o abandonarse mientras tanto
        carritoRepository.findByIdForUpdate(carritoId)
                .filter(carrito -> EstadoCarrito.EN_CURSO.contains(carrito.getEstado()) && !carrito.estaVigente(ahora))
                .ifPresent(carrito -> abandonarYLiberar(carrito, ahora));
    }

    // Carrito abierto del usuario (ACTIVO o EN_PAGO), bloqueado para modificarlo. Uno vencido se trata como inexistente (lo libera el job)
    private Carrito carritoAbiertoBloqueado(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoRepository.findEnCursoForUpdate(usuarioId)
                .orElseThrow(CarritoActivoInexistenteException::new);
        if (!carrito.estaVigente(FechaCatalogo.ahora())) {
            throw new CarritoActivoInexistenteException();
        }
        return carrito;
    }

    private ItemCarrito buscarItem(Carrito carrito, Integer itemId) throws ItemCarritoInexistenteException {
        return carrito.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(ItemCarritoInexistenteException::new);
    }

    // Para apartar entradas: evento y oferta a la venta, y stock para la cantidad pedida (AGOTADO se informa como falta de stock)
    private void validarVendible(EventoTipoEntrada ete, int cantidad, LocalDateTime ahora)
            throws EventoNoDisponibleException, EventoTipoEntradaNoDisponibleException,
            VentaNoHabilitadaException, StockInsuficienteException {
        if (!EVENTO_ACTIVO.equalsIgnoreCase(ete.getEvento().getEstado())) {
            throw new EventoNoDisponibleException();
        }
        if (ete.getEvento().haFinalizado(FechaCatalogo.ahora())) {
            throw new EventoFinalizadoException();
        }
        if (ete.getEstado() == EstadoEventoTipoEntrada.AGOTADO) {
            throw sinStock(ete);
        }
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }
        validarPeriodoDeVenta(ete, ahora);
        if (ete.getCantidadDisponible() < cantidad) {
            throw sinStock(ete);
        }
    }

    // Para entradas ya apartadas no se mira el stock (AGOTADO es normal); solo bloquea que se pause o finalice la oferta o se cancele el evento
    private void validarVenta(EventoTipoEntrada ete, LocalDateTime ahora)
            throws EventoNoDisponibleException, EventoTipoEntradaNoDisponibleException, VentaNoHabilitadaException {
        if (!EVENTO_ACTIVO.equalsIgnoreCase(ete.getEvento().getEstado())) {
            throw new EventoNoDisponibleException();
        }
        if (ete.getEvento().haFinalizado(FechaCatalogo.ahora())) {
            throw new EventoFinalizadoException();
        }
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO && ete.getEstado() != EstadoEventoTipoEntrada.AGOTADO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }
        validarPeriodoDeVenta(ete, ahora);
    }

    private void validarPeriodoDeVenta(EventoTipoEntrada ete, LocalDateTime ahora) throws VentaNoHabilitadaException {
        if (ete.getFechaInicioVenta() != null && ahora.isBefore(ete.getFechaInicioVenta())) {
            throw new VentaNoHabilitadaException();
        }
        if (ete.getFechaFinVenta() != null && ahora.isAfter(ete.getFechaFinVenta())) {
            throw new VentaNoHabilitadaException();
        }
    }

    private StockInsuficienteException sinStock(EventoTipoEntrada ete) {
        int quedan = Math.max(ete.getCantidadDisponible(), 0);
        return new StockInsuficienteException("No hay stock suficiente de " + ete.getTipoEntrada().getNombre()
                + " (" + ete.getEvento().getTitulo() + "): " + (quedan == 1 ? "queda 1" : "quedan " + quedan));
    }

    private void reservar(EventoTipoEntrada ete, int cantidad) {
        ete.setCantidadDisponible(ete.getCantidadDisponible() - cantidad);
        if (ete.getCantidadDisponible() == 0) {
            ete.setEstado(EstadoEventoTipoEntrada.AGOTADO);
        }
        eventoTipoEntradaRepository.save(ete);
    }

    private void devolver(EventoTipoEntrada ete, int cantidad) {
        ete.setCantidadDisponible(ete.getCantidadDisponible() + cantidad);
        if (ete.getEstado() == EstadoEventoTipoEntrada.AGOTADO && ete.getCantidadDisponible() > 0) {
            ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        }
        eventoTipoEntradaRepository.save(ete);
    }

    private void devolverItem(ItemCarrito item) {
        bloquearOferta(item.getEventoTipoEntrada().getId())
                .ifPresent(ete -> devolver(ete, item.getCantidad()));
    }

    // Bloquea la fila de la oferta y trae el stock actual. El refresh hace falta porque la oferta ya viene cargada con
    // los items del carrito, con el stock de antes del bloqueo; sin él se pisaría lo que otra operación confirmó mientras tanto.
    private Optional<EventoTipoEntrada> bloquearOferta(Integer id) {
        Optional<EventoTipoEntrada> oferta = eventoTipoEntradaRepository.findByIdForUpdate(id);
        oferta.ifPresent(entityManager::refresh);
        return oferta;
    }

    // Devuelve al stock las entradas apartadas (ofertas bloqueadas por id, como en la compra). Sin vencimiento no apartó nada
    private void devolverItems(Carrito carrito) {
        if (carrito.getFechaVencimiento() == null) {
            return;
        }
        List<ItemCarrito> ordenados = carrito.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getEventoTipoEntrada().getId()))
                .toList();
        ordenados.forEach(this::devolverItem);
    }

    private void volverAActivo(Carrito carrito) {
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaVencimiento(null);
    }

    private void abandonarYLiberar(Carrito carrito, LocalDateTime ahora) {
        devolverItems(carrito);
        carrito.getItems().clear();
        carrito.setEstado(EstadoCarrito.ABANDONADO);
        carrito.setFechaActualizacion(ahora);
        carritoRepository.save(carrito);
    }
}
