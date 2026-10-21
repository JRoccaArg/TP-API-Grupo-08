package com.uade.tpo.Zenoirprod.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
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

    Page<Carrito> findByUsuario_IdOrderByFechaCreacionDesc(Integer usuarioId, Pageable pageable);

    boolean existsByItems_EventoTipoEntrada_Id(Integer eventoTipoEntradaId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Carrito c WHERE c.usuario.id = :usuarioId AND c.estado IN :estados")
    Optional<Carrito> findByUsuarioIdAndEstadoInForUpdate(@Param("usuarioId") Integer usuarioId,
            @Param("estados") Collection<EstadoCarrito> estados);

    default Optional<Carrito> findEnCursoForUpdate(Integer usuarioId) {
        return findByUsuarioIdAndEstadoInForUpdate(usuarioId, EstadoCarrito.EN_CURSO);
    }

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Carrito c WHERE c.id = :id")
    Optional<Carrito> findByIdForUpdate(@Param("id") Integer id);

    // Ids de carritos abiertos vencidos, o con entradas pero sin vencimiento (anteriores a la reserva); cada uno se libera en su propia transacción
    @Query("SELECT c.id FROM Carrito c WHERE c.estado IN :estados AND "
            + "((c.fechaVencimiento IS NOT NULL AND c.fechaVencimiento < :ahora) "
            + "OR (c.fechaVencimiento IS NULL AND c.items IS NOT EMPTY))")
    List<Integer> findIdsVencidos(@Param("estados") Collection<EstadoCarrito> estados,
            @Param("ahora") LocalDateTime ahora);
}
