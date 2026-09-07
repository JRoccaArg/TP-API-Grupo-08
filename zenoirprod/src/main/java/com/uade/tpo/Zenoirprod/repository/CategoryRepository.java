package com.uade.tpo.Zenoirprod.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByNombre(String nombre);
}
