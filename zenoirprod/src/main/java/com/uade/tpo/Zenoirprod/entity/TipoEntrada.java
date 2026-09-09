package com.uade.tpo.Zenoirprod.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Tipos_Entrada")
public class TipoEntrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "descripcion_base", nullable = false, length = 500)
    private String descripcionBase;

    @Column(nullable = false)
    private Boolean activo;
}
