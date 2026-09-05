package com.uade.tpo.Zenoirprod.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Detalles_Compras")
public class DetalleCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_tipo_entrada_id", nullable = false)
    private EventoTipoEntrada eventoTipoEntrada;

    @Column(nullable = false)
    private Integer cantidad;

    // Snapshot del precio al momento de la compra: si el precio o el descuento
    // del EventoTipoEntrada cambian despues, la compra vieja mantiene lo que
    // pago el usuario.
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "detalle_compra_id", nullable = false)
    private List<Ticket> tickets = new ArrayList<>();
}
