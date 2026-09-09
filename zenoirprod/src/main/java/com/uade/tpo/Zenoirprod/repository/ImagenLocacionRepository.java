package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;

public interface ImagenLocacionRepository extends JpaRepository<ImagenLocacion, Integer> {
    Page<ImagenLocacion> findByLocacionIdOrderByOrdenAsc(Integer locacionId, Pageable pageable);

    public java.util.List<ImagenLocacion> findByLocacionIdOrderByOrdenAsc(Integer locacionId);
}
