package com.uade.tpo.Zenoirprod.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.Zenoirprod.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    Optional<Ticket> findByCodigoQr(String codigoQr);

    @Query("SELECT COUNT(t) > 0 FROM Compra c JOIN c.detalles d JOIN d.tickets t "
            + "WHERE t.id = :ticketId AND c.usuario.email = :email")
    boolean perteneceAUsuario(@Param("ticketId") Integer ticketId, @Param("email") String email);
}
