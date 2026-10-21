package com.uade.tpo.Zenoirprod.service;

public interface MailService {

    // Manda al comprador un mail con sus entradas (una imagen de QR por entrada). Si falla, no rompe la compra
    void enviarEntradas(Integer compraId);
}
