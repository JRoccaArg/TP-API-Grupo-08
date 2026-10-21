package com.uade.tpo.Zenoirprod.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

// Pasa a FINALIZADO los eventos ACTIVOS cuya fecha de fin ya llegó. Corre al arrancar y después una vez por hora.
// Igual la compra se frena sola al llegar la fecha de fin (ver validarVenta).
@Slf4j
@Component
public class EventoFinalizacionScheduler {
    @Autowired
    private EventosService eventosService;

    @Scheduled(initialDelayString = "${eventos.finalizacion-inicial-ms:5000}", fixedDelayString = "${eventos.finalizacion-ms:3600000}")
    public void finalizarVencidos() {
        try {
            int cantidad = eventosService.finalizarVencidos();
            if (cantidad > 0) {
                log.info("Eventos pasados a FINALIZADO por fecha de fin: {}", cantidad);
            }
        } catch (RuntimeException e) {
            log.error("No se pudieron finalizar los eventos vencidos", e);
        }
    }
}
