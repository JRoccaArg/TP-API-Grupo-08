package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.Zenoirprod.entity.ImagenEvento;

public interface ImagenEventoRepository extends JpaRepository<ImagenEvento, Integer> {
    Page<ImagenEvento> findByEventoIdOrderByOrdenAsc(Integer eventoId, Pageable pageable);

    public java.util.List<ImagenEvento> findByEventoIdOrderByOrdenAsc(Integer eventoId);
}
