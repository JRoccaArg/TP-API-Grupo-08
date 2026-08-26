package com.uade.tpo.Zenoirprod.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


/* SOLAMENTE CREADA CON LO MÍNIMO PARA PODER IR HACIENDO EVENTOS MIENTRAS. HAY QUE COMPLETAR ESTA CLASE */

@Data
@Entity
@Table(name = "Locaciones")
public class Locacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column
    private String nombre;
}