package com.uade.tpo.Zenoirprod.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
    Optional<Carrito> findByUsuario_IdAndEstado(Integer usuarioId, EstadoCarrito estado);

    Page<Carrito> findByUsuario_IdOrderByFechaCreacionDesc(Integer usuarioId, Pageable pageable);

    boolean existsByItems_EventoTipoEntrada_Id(Integer eventoTipoEntradaId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Carrito c WHERE c.id = :id")
    Optional<Carrito> findByIdForUpdate(@Param("id") Integer id);
}
