package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    Page<Compra> findByUsuario_IdOrderByFechaCompraDesc(Integer usuarioId, Pageable pageable);

    boolean existsByDetalles_EventoTipoEntrada_Id(Integer eventoTipoEntradaId);
}
