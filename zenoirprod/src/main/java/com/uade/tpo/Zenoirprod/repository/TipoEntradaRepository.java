package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;

@Repository
public interface TipoEntradaRepository extends JpaRepository<TipoEntrada, Integer> {

}
