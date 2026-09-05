package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Evento;

@Repository
public interface EventosRepository extends JpaRepository<Evento, Integer> {

    boolean existsByLocacion_Id(Integer locacionId);

}
