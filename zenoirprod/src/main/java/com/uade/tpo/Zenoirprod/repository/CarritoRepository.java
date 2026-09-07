package com.uade.tpo.Zenoirprod.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
    Optional<Carrito> findByUsuario_IdAndEstado(Integer usuarioId, EstadoCarrito estado);

    List<Carrito> findByUsuario_IdOrderByFechaCreacionDesc(Integer usuarioId);
}
