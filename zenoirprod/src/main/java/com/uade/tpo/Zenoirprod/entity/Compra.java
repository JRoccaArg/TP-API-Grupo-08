package com.uade.tpo.Zenoirprod.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Compras")
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // usuarioId y carritoId se guardan como columnas planas y no como relacion
    // JPA hasta que existan Usuario y Carrito en la version que van a usar el
    // resto del equipo. Cuando esten, se cambia a @ManyToOne sin migrar datos.
    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "carrito_id")
    private Integer carritoId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCompra estado;

    @Column(nullable = false)
    private LocalDateTime fechaCompra;

    private LocalDateTime fechaCancelacion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "compra_id", nullable = false)
    private List<DetalleCompra> detalles = new ArrayList<>();

    public enum EstadoCompra {
        CONFIRMADA,
        CANCELADA
    }
}
