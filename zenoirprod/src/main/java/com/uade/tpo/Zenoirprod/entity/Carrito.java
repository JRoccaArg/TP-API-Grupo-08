package com.uade.tpo.Zenoirprod.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Carritos")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Se oculta el password al serializar el carrito en JSON
    @JsonIgnoreProperties({ "password", "hibernateLazyInitializer", "handler" })
    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCarrito estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    // Hasta cuándo están apartadas las entradas (reloj de armado en ACTIVO, de pago en EN_PAGO). Null si no hay entradas
    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "carrito_id", nullable = false)
    private List<ItemCarrito> items = new ArrayList<>();

    // Vence al pasar su fechaVencimiento (hasta que el job lo libera se trata como inexistente). Un ACTIVO sin entradas no vence;
    // uno con entradas y sin vencimiento es anterior a la reserva y no se puede usar.
    public boolean estaVigente(LocalDateTime ahora) {
        if (estado == EstadoCarrito.ACTIVO && items.isEmpty()) {
            return true;
        }
        if (estado == EstadoCarrito.ACTIVO || estado == EstadoCarrito.EN_PAGO) {
            return fechaVencimiento != null && !ahora.isAfter(fechaVencimiento);
        }
        return false;
    }

    public enum EstadoCarrito {
        ACTIVO,       // lo está armando: entradas apartadas hasta fechaVencimiento
        EN_PAGO,      // en la pantalla de pago: reloj de pago nuevo hasta fechaVencimiento
        CONVERTIDO,   // ya se pagó: es una compra
        ABANDONADO;   // lo abandonó o se venció el tiempo

        // Un usuario tiene como máximo un carrito en alguno de estos estados
        public static final List<EstadoCarrito> EN_CURSO = List.of(ACTIVO, EN_PAGO);
    }
}
