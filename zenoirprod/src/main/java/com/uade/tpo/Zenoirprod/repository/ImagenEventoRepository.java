package com.uade.tpo.Zenoirprod.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;

public interface ImagenEventoRepository extends JpaRepository<ImagenEvento, Integer> {
    public List<ImagenEvento> findByEventoId(Integer eventoId);
}
