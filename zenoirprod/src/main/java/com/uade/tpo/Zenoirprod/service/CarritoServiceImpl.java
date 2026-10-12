package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@Service
public class CarritoServiceImpl implements CarritoService {

    @Autowired private CarritoRepository carritoRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private UserRepository userRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito obtenerOCrearActivo(User usuario) {
        // Se bloquea la fila del usuario para que dos pedidos simultaneos no creen dos carritos activos.
        User bloqueado = userRepository.findByIdForUpdate(usuario.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Optional<Carrito> existente = carritoRepository.findByUsuario_IdAndEstado(
                bloqueado.getId(), EstadoCarrito.ACTIVO);
        if (existente.isPresent()) {
            return existente.get();
        }

        LocalDateTime ahora = LocalDateTime.now();
        Carrito carrito = new Carrito();
        carrito.setUsuario(bloqueado);
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaCreacion(ahora);
        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito getActivo(Integer usuarioId) throws CarritoActivoInexistenteException {
        return carritoActivo(usuarioId);
    }

    @Override
    public Page<Carrito> getPorUsuario(Integer usuarioId, PageRequest pageRequest) {
        return carritoRepository.findByUsuario_IdOrderByFechaCreacionDesc(usuarioId, pageRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito agregarItem(User usuario, ItemCarritoRequest request)
            throws ItemCarritoInvalidoException, EventoTipoEntradaInexistenteException,
            EventoTipoEntradaNoDisponibleException, StockInsuficienteException {

        if (request.getEventoTipoEntradaId() == null
                || request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        EventoTipoEntrada ete = eventoTipoEntradaRepository.findById(request.getEventoTipoEntradaId())
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }

        // Agregar el primer item crea el carrito si el usuario todavia no tiene uno activo.
        // Si algo falla mas abajo, la transaccion se revierte y no queda un carrito vacio de mas.
        Carrito carrito = obtenerOCrearActivo(usuario);

        Optional<ItemCarrito> itemExistente = carrito.getItems().stream()
                .filter(item -> item.getEventoTipoEntrada().getId().equals(ete.getId()))
                .findFirst();

        int cantidadFinal = request.getCantidad()
                + itemExistente.map(ItemCarrito::getCantidad).orElse(0);
        if (ete.getCantidadDisponible() < cantidadFinal) {
            throw new StockInsuficienteException();
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (itemExistente.isPresent()) {
            itemExistente.get().setCantidad(cantidadFinal);
            itemExistente.get().setFechaAgregado(ahora);
        } else {
            ItemCarrito item = new ItemCarrito();
            item.setEventoTipoEntrada(ete);
            item.setCantidad(request.getCantidad());
            item.setFechaAgregado(ahora);
            carrito.getItems().add(item);
        }

        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito actualizarCantidad(Integer usuarioId, Integer itemId, Integer cantidad)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, StockInsuficienteException {

        if (cantidad == null || cantidad <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        Carrito carrito = carritoActivo(usuarioId);

        ItemCarrito item = buscarItem(carrito, itemId);
        if (item.getEventoTipoEntrada().getCantidadDisponible() < cantidad) {
            throw new StockInsuficienteException();
        }

        item.setCantidad(cantidad);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito quitarItem(Integer usuarioId, Integer itemId)
            throws CarritoActivoInexistenteException, ItemCarritoInexistenteException {
        Carrito carrito = carritoActivo(usuarioId);

        ItemCarrito item = buscarItem(carrito, itemId);
        carrito.getItems().remove(item);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito vaciar(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoActivo(usuarioId);

        carrito.getItems().clear();
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Carrito abandonar(Integer usuarioId) throws CarritoActivoInexistenteException {
        Carrito carrito = carritoActivo(usuarioId);

        carrito.setEstado(EstadoCarrito.ABANDONADO);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    private Carrito carritoActivo(Integer usuarioId) throws CarritoActivoInexistenteException {
        return carritoRepository.findByUsuario_IdAndEstado(usuarioId, EstadoCarrito.ACTIVO)
                .orElseThrow(CarritoActivoInexistenteException::new);
    }

    // Solo busca entre los items del carrito activo del propio usuario: un itemId ajeno nunca se encuentra.
    private ItemCarrito buscarItem(Carrito carrito, Integer itemId) throws ItemCarritoInexistenteException {
        return carrito.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(ItemCarritoInexistenteException::new);
    }
}
