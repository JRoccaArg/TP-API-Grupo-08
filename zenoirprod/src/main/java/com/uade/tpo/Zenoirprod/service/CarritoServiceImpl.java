package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.entity.dto.CarritoRequest;
import com.uade.tpo.Zenoirprod.entity.dto.ItemCarritoRequest;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.CarritoNoModificableException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoTipoEntradaNoDisponibleException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.ItemCarritoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.StockInsuficienteException;
import com.uade.tpo.Zenoirprod.exceptions.UsuarioInexistenteException;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@Service
public class CarritoServiceImpl implements CarritoService {

    @Autowired private CarritoRepository carritoRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private UserRepository userRepository;

    @Override
    @Transactional
    public Carrito obtenerOCrearActivo(CarritoRequest request)
            throws CarritoInvalidoException, UsuarioInexistenteException {
        if (request.getUsuarioId() == null) {
            throw new CarritoInvalidoException();
        }
        User usuario = userRepository.findById(request.getUsuarioId())
                .orElseThrow(UsuarioInexistenteException::new);

        Optional<Carrito> existente = carritoRepository.findByUsuario_IdAndEstado(
                usuario.getId(), EstadoCarrito.ACTIVO);
        if (existente.isPresent()) {
            return existente.get();
        }

        LocalDateTime ahora = LocalDateTime.now();
        Carrito carrito = new Carrito();
        carrito.setUsuario(usuario);
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaCreacion(ahora);
        carrito.setFechaActualizacion(ahora);
        return carritoRepository.save(carrito);
    }

    @Override
    public Optional<Carrito> getPorId(Integer id) {
        return carritoRepository.findById(id);
    }

    @Override
    public List<Carrito> getPorUsuario(Integer usuarioId) {
        return carritoRepository.findByUsuario_IdOrderByFechaCreacionDesc(usuarioId);
    }

    @Override
    @Transactional
    public Carrito agregarItem(Integer carritoId, ItemCarritoRequest request)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInvalidoException,
            EventoTipoEntradaInexistenteException, EventoTipoEntradaNoDisponibleException,
            StockInsuficienteException {

        if (request.getEventoTipoEntradaId() == null
                || request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        validarActivo(carrito);

        EventoTipoEntrada ete = eventoTipoEntradaRepository.findById(request.getEventoTipoEntradaId())
                .orElseThrow(EventoTipoEntradaInexistenteException::new);
        if (ete.getEstado() != EstadoEventoTipoEntrada.ACTIVO) {
            throw new EventoTipoEntradaNoDisponibleException();
        }

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
    @Transactional
    public Carrito actualizarCantidad(Integer carritoId, Integer itemId, Integer cantidad)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException,
            ItemCarritoInvalidoException, StockInsuficienteException {

        if (cantidad == null || cantidad <= 0) {
            throw new ItemCarritoInvalidoException();
        }

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        validarActivo(carrito);

        ItemCarrito item = buscarItem(carrito, itemId);
        if (item.getEventoTipoEntrada().getCantidadDisponible() < cantidad) {
            throw new StockInsuficienteException();
        }

        item.setCantidad(cantidad);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito quitarItem(Integer carritoId, Integer itemId)
            throws CarritoInexistenteException, CarritoNoModificableException, ItemCarritoInexistenteException {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        validarActivo(carrito);

        ItemCarrito item = buscarItem(carrito, itemId);
        carrito.getItems().remove(item);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito vaciar(Integer carritoId) throws CarritoInexistenteException, CarritoNoModificableException {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        validarActivo(carrito);

        carrito.getItems().clear();
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito abandonar(Integer carritoId) throws CarritoInexistenteException, CarritoNoModificableException {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(CarritoInexistenteException::new);
        if (carrito.getEstado() == EstadoCarrito.CONVERTIDO) {
            throw new CarritoNoModificableException();
        }

        carrito.setEstado(EstadoCarrito.ABANDONADO);
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    private void validarActivo(Carrito carrito) throws CarritoNoModificableException {
        if (carrito.getEstado() != EstadoCarrito.ACTIVO) {
            throw new CarritoNoModificableException();
        }
    }

    private ItemCarrito buscarItem(Carrito carrito, Integer itemId) throws ItemCarritoInexistenteException {
        return carrito.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(ItemCarritoInexistenteException::new);
    }
}
