package com.uade.tpo.Zenoirprod.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.dto.VentaPorEntrada;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    Page<Compra> findByUsuario_IdOrderByFechaCompraDesc(Integer usuarioId, Pageable pageable);

    boolean existsByDetalles_EventoTipoEntrada_Id(Integer eventoTipoEntradaId);

    // La compra a la que pertenece el ticket con ese codigo QR: de ahi salen el comprador y el evento.
    @Query("SELECT c FROM Compra c JOIN c.detalles d JOIN d.tickets t WHERE t.codigoQr = :codigoQr")
    Optional<Compra> findByCodigoQrDeTicket(@Param("codigoQr") String codigoQr);

    // --- Estadisticas de un evento (ver EstadisticasServiceImpl) ---
    // Entradas vendidas y lo recaudado (lo que se pago) por cada entrada del evento, en las compras con ese estado.
    @Query("SELECT new com.uade.tpo.Zenoirprod.entity.dto.VentaPorEntrada(d.eventoTipoEntrada.id, SUM(d.cantidad), SUM(d.subtotal)) "
            + "FROM Compra c JOIN c.detalles d WHERE d.eventoTipoEntrada.evento.id = :eventoId AND c.estado = :estado "
            + "GROUP BY d.eventoTipoEntrada.id")
    List<VentaPorEntrada> ventasPorEntrada(@Param("eventoId") Integer eventoId, @Param("estado") EstadoCompra estado);

    // Cuantas compras distintas incluyen entradas del evento.
    @Query("SELECT COUNT(DISTINCT c.id) FROM Compra c JOIN c.detalles d "
            + "WHERE d.eventoTipoEntrada.evento.id = :eventoId AND c.estado = :estado")
    long contarCompras(@Param("eventoId") Integer eventoId, @Param("estado") EstadoCompra estado);

    // Cuantos tickets del evento estan en ese estado (por ejemplo, UTILIZADO: ya ingresaron).
    @Query("SELECT COUNT(t) FROM Compra c JOIN c.detalles d JOIN d.tickets t "
            + "WHERE d.eventoTipoEntrada.evento.id = :eventoId AND t.estado = :estado")
    long contarTickets(@Param("eventoId") Integer eventoId, @Param("estado") EstadoTicket estado);
}
