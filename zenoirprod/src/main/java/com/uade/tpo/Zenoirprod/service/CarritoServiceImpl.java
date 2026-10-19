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

// Reserva de stock: las entradas de un carrito abierto ya estan descontadas de cantidadDisponible. Se apartan al
// agregarlas y se devuelven si el usuario las quita, vacia o abandona el carrito, o si se vence el tiempo.
//   ACTIVO   -> el usuario esta armando el carrito. Reloj de armado: fechaVencimiento = primera entrada + 15 min,
//               no se renueva al agregar mas.
//   EN_PAGO  -> entro a la pantalla de pago. Reloj de pago nuevo: fechaVencimiento = ese momento + 15 min. Sigue
//               pudiendo modificar el carrito, sin tocar el reloj.
//   CONVERTIDO / ABANDONADO -> terminales. Al abandonar o vencer se devuelven las entradas y se vacian los items.
// Pagar (CompraServiceImpl) no vuelve a descontar stock.
//
// Orden de bloqueos, siempre el mismo para evitar deadlocks entre pedidos simultaneos:
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
        // Se bloquea la fila del usuario para que dos pedidos simultaneos no creen dos carritos abiertos.
        User bloqueado = userRepository.findByIdForUpdate(usuario.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        LocalDateTime ahora = FechaCatalogo.ahora();

        // El carrito se lee ya bloqueado, para no pisar una compra o un vencimiento que lo este cerrando.
        Optional<Carrito> existente = carritoRepository.findEnCursoForUpdate(bloqueado.getId());
        if (existente.isPresent()) {
            if (existente.get().estaVigente(ahora)) {
                return existente.get();
            }
            // Se le vencio el tiempo y el job todavia no lo libero: se libera ahora y empieza uno nuevo.
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

        // Agregar el primer item crea el carrito si el usuario todavia no tiene uno abierto.
        // Si algo falla mas abajo, la transaccion se revierte y no queda un carrito vacio de mas.
        Carrito carrito = obtenerOCrearActivo(usuario);

        EventoTipoEntrada ete = bloquearOferta(request.getEventoTipoEntradaId())
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        LocalDateTime ahora = FechaCatalogo.ahora();

        // Solo la cantidad nueva necesita stock: lo que el usuario ya tenia en el carrito esta apartado.
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

        // La primera entrada arranca el reloj de armado; las siguientes no lo renuevan. Un carrito EN_PAGO ya
        // tiene su reloj de pago y tampoco se toca.
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
        // Ya esta en la pantalla de pago (por ejemplo el usuario recargo): el reloj no se reinicia, asi nadie puede
        // retener entradas entrando a pagar una y otra vez.
        if (carrito.getEstado() == EstadoCarrito.EN_PAGO) {
            return carrito;
        }
        if (carrito.getItems().isEmpty()) {
            throw new CarritoVacioException();
        }

        LocalDateTime ahora = FechaCatalogo.ahora();
        // Las entradas ya estan apartadas: solo se avisa ahora si el admin pauso la oferta o cancelo el evento.
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
        // Se vuelve a mirar el estado ya con el carrito bloqueado: puede haber sido pagado o abandonado mientras tanto.
        carritoRepository.findByIdForUpdate(carritoId)
                .filter(carrito -> EstadoCarrito.EN_CURSO.contains(carrito.getEstado()) && !carrito.estaVigente(ahora))
                .ifPresent(carrito -> abandonarYLiberar(carrito, ahora));
    }

    // Carrito abierto (ACTIVO o EN_PAGO) del usuario, bloqueado para modificarlo. Uno vencido se trata como
    // inexistente: sus entradas las libera el job (o el proximo "agregar") y no se puede operar sobre el.
    private Carrito carritoAbiertoBloqueado(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoRepository.findEnCursoForUpdate(usuarioId)
                .orElseThrow(CarritoActivoInexistenteException::new);
        if (!carrito.estaVigente(FechaCatalogo.ahora())) {
            throw new CarritoActivoInexistenteException();
        }
        return carrito;
    }

    // Solo busca entre los items del carrito abierto del propio usuario: un itemId ajeno nunca se encuentra.
    private ItemCarrito buscarItem(Carrito carrito, Integer itemId) throws ItemCarritoInexistenteException {
        return carrito.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(ItemCarritoInexistenteException::new);
    }

    // Para apartar entradas: evento y oferta a la venta, y stock para la cantidad pedida. Una oferta AGOTADO se
    // informa como falta de stock, que es lo que ve el usuario cuando otros tienen apartadas todas las entradas.
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

    // Para entradas que ya estan apartadas: no se mira el stock. AGOTADO es normal (puede estarlo por este mismo
    // carrito); lo que bloquea es que el admin pause o finalice la oferta, o cancele el evento.
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

    // Dice cual entrada falto y cuantas quedan, para que el usuario sepa que cantidad puede pedir.
    private StockInsuficienteException sinStock(EventoTipoEntrada ete) {
        int quedan = Math.max(ete.getCantidadDisponible(), 0);
        return new StockInsuficienteException("No hay stock suficiente de " + ete.getTipoEntrada().getNombre()
                + " (" + ete.getEvento().getTitulo() + "): " + (quedan == 1 ? "queda 1" : "quedan " + quedan));
    }

    // La oferta debe llegar ya bloqueada (bloquearOferta).
    private void reservar(EventoTipoEntrada ete, int cantidad) {
        ete.setCantidadDisponible(ete.getCantidadDisponible() - cantidad);
        if (ete.getCantidadDisponible() == 0) {
            ete.setEstado(EstadoEventoTipoEntrada.AGOTADO);
        }
        eventoTipoEntradaRepository.save(ete);
    }

    // La oferta debe llegar ya bloqueada (bloquearOferta).
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

    // Bloquea la fila de la oferta y trae su stock actual. El refresh es necesario: la oferta ya viene cargada con
    // los items del carrito, con el stock de antes de esperar el bloqueo. Sin refrescar se pisaria lo que otra
    // operacion confirmo mientras tanto (se perderian reservas o devoluciones).
    private Optional<EventoTipoEntrada> bloquearOferta(Integer id) {
        Optional<EventoTipoEntrada> oferta = eventoTipoEntradaRepository.findByIdForUpdate(id);
        oferta.ifPresent(entityManager::refresh);
        return oferta;
    }

    // Devuelve al stock las entradas apartadas, con las ofertas bloqueadas ordenadas por id (igual que en la
    // compra). Un carrito sin vencimiento no aparto nada (esta vacio o es anterior a la reserva): no hay que devolver.
    private void devolverItems(Carrito carrito) {
        if (carrito.getFechaVencimiento() == null) {
            return;
        }
        List<ItemCarrito> ordenados = carrito.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getEventoTipoEntrada().getId()))
                .toList();
        ordenados.forEach(this::devolverItem);
    }

    // Un carrito que se queda sin entradas vuelve a ser uno que se esta armando, sin reloj.
    private void volverAActivo(Carrito carrito) {
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaVencimiento(null);
    }

    // Cierra el carrito devolviendo las entradas apartadas (si las habia) y vaciando sus items.
    private void abandonarYLiberar(Carrito carrito, LocalDateTime ahora) {
        devolverItems(carrito);
        carrito.getItems().clear();
        carrito.setEstado(EstadoCarrito.ABANDONADO);
        carrito.setFechaActualizacion(ahora);
        carritoRepository.save(carrito);
    }
}
