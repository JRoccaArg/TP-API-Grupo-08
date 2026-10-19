package com.uade.tpo.Zenoirprod.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    Page<Compra> findByUsuario_IdOrderByFechaCompraDesc(Integer usuarioId, Pageable pageable);

    boolean existsByDetalles_EventoTipoEntrada_Id(Integer eventoTipoEntradaId);

    // La compra a la que pertenece el ticket con ese codigo QR: de ahi salen el comprador y el evento.
    @Query("SELECT c FROM Compra c JOIN c.detalles d JOIN d.tickets t WHERE t.codigoQr = :codigoQr")
    Optional<Compra> findByCodigoQrDeTicket(@Param("codigoQr") String codigoQr);
}
