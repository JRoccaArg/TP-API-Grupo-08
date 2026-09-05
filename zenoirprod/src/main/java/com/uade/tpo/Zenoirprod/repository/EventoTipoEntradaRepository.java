package com.uade.tpo.Zenoirprod.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;

@Repository
public interface EventoTipoEntradaRepository extends JpaRepository<EventoTipoEntrada, Integer> {

    boolean existsByEvento_IdAndTipoEntrada_Id(Integer eventoId, Integer tipoEntradaId);

    List<EventoTipoEntrada> findByEvento_Id(Integer eventoId);
}
