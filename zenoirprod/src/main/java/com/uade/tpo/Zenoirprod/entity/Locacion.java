package com.uade.tpo.Zenoirprod.entity;


import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "Locaciones")
public class Locacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true, length = 150)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(name = "capacidad_max", nullable = false)
    private Integer capacidadMax;

    @OneToMany(mappedBy = "locacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<ImagenLocacion> imagenes = new ArrayList<>();
}
