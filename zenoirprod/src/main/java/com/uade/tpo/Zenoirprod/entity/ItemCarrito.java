package com.uade.tpo.Zenoirprod.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "Items_Carrito")
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_tipo_entrada_id", nullable = false)
    private EventoTipoEntrada eventoTipoEntrada;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "fecha_agregado", nullable = false)
    private LocalDateTime fechaAgregado;
}
