package com.uade.tpo.Zenoirprod.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "Imagenes_Eventos")
public class ImagenEvento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private String tipoContenido;

    @Column(nullable = false)
    private Long tamanio;

    @Lob
    @Column (nullable = false)
    @JsonIgnore
    private byte[] datos;

    //Si no pones el tipo como String, en lugar del Strin guarda 0 y 1
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoImagenEvento tipoImagenEvento;

    @Column
    private String descripcion;

    @Column
    private Integer orden;

}
