package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

import lombok.extern.slf4j.Slf4j;

// Libera las entradas de los carritos abiertos (en armado o en pago) cuyo tiempo venció. Cada carrito va en su propia
// transacción (vía CarritoService): si uno falla, los demás se liberan igual y el fallido se reintenta en la próxima pasada.
@Slf4j
@Component
public class CarritoVencimientoScheduler {

    @Autowired private CarritoRepository carritoRepository;
    @Autowired private CarritoService carritoService;

    @Scheduled(fixedDelayString = "${carrito.limpieza-ms:60000}")
    public void abandonarVencidos() {
        for (Integer carritoId : carritoRepository.findIdsVencidos(EstadoCarrito.EN_CURSO, FechaCatalogo.ahora())) {
            try {
                carritoService.abandonarSiVencido(carritoId);
            } catch (RuntimeException e) {
                log.error("No se pudieron liberar las entradas del carrito {}", carritoId, e);
            }
        }
    }
}
