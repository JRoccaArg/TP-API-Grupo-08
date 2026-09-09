package com.uade.tpo.Zenoirprod.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;

@Repository
public interface EventoTipoEntradaRepository extends JpaRepository<EventoTipoEntrada, Integer> {

    boolean existsByEvento_IdAndTipoEntrada_Id(Integer eventoId, Integer tipoEntradaId);

    Page<EventoTipoEntrada> findByEvento_Id(Integer eventoId, Pageable pageable);

    boolean existsByEvento_Id(Integer eventoId);

    boolean existsByTipoEntrada_Id(Integer tipoEntradaId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EventoTipoEntrada e WHERE e.id = :id")
    Optional<EventoTipoEntrada> findByIdForUpdate(@Param("id") Integer id);
}
