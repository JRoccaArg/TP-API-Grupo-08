package com.uade.tpo.Zenoirprod.entity;


import java.time.LocalDateTime;

import org.hibernate.annotations.Check;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Eventos")
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    
    @Column(nullable = false)
    private LocalDateTime fecha_hora;

    @Column(nullable = false)
    @Check(constraints = "estado IN ('BORRADOR', 'ACTIVO', 'FINALIZADO', 'CANCELADO', 'REPROGRAMADO')")
    private String estado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locacion_id",nullable = false)
    private Locacion locacion;
    
}
