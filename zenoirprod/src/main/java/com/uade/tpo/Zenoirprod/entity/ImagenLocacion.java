package com.uade.tpo.Zenoirprod.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Imagenes_Locacion")
public class ImagenLocacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locacion_id", nullable = false)
    private Locacion locacion;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private String tipoContenido;

    @Column(nullable = false)
    private Long tamanio;

    @Lob
    @Column(nullable = false)
    @JsonIgnore
    private byte[] datos;

    @Column
    private String textoAlternativo;

    @Column
    private Integer orden;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
}
