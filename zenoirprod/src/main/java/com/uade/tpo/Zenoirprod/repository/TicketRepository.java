package com.uade.tpo.Zenoirprod.repository;

import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    Optional<Ticket> findByCodigoQr(String codigoQr);

    // Bloqueo pesimista para evitar el doble uso del mismo ticket ante requests concurrentes.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.codigoQr = :codigoQr")
    Optional<Ticket> findByCodigoQrForUpdate(@Param("codigoQr") String codigoQr);

    @Query("SELECT COUNT(t) > 0 FROM Compra c JOIN c.detalles d JOIN d.tickets t "
            + "WHERE t.id = :ticketId AND c.usuario.email = :email")
    boolean perteneceAUsuario(@Param("ticketId") Integer ticketId, @Param("email") String email);
}
