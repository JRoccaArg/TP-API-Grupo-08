package com.uade.tpo.Zenoirprod.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    List<Compra> findByUsuario_IdOrderByFechaCompraDesc(Integer usuarioId);
}
