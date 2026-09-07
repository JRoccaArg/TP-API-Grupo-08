package com.uade.tpo.Zenoirprod.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;

public interface ImagenLocacionRepository extends JpaRepository<ImagenLocacion, Integer> {
    public List<ImagenLocacion> findByLocacionIdOrderByOrdenAsc(Integer locacionId);
}
