package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.util.MailEntradas;
import com.uade.tpo.Zenoirprod.util.MailEntradas.EntradaMail;
import com.uade.tpo.Zenoirprod.util.QrImagen;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

// Mail con las entradas de una compra, enviado con JavaMail (JavaMailSender de Spring).
// Corre en segundo plano (@Async): la compra responde enseguida y, si el mail falla, la compra igual queda hecha.
// Con zenoir.mail.activo=false (el valor por defecto) no se manda nada: solo queda anotado en el log.
@Slf4j
@Service
public class MailServiceImpl implements MailService {

    private static final DateTimeFormatter FECHA =
            DateTimeFormatter.ofPattern("EEEE d 'de' MMMM · HH:mm 'h'", Locale.forLanguageTag("es-AR"));

    @Autowired private JavaMailSender mailSender;
    @Autowired private CompraRepository compraRepository;

    @Value("${zenoir.mail.activo:false}") private boolean activo;
    @Value("${zenoir.mail.remitente:}") private String remitente;
    @Value("${zenoir.front.url:http://localhost:5173}") private String urlFront;

    @Async
    @Override
    @Transactional(readOnly = true)
    public void enviarEntradas(Integer compraId) {
        Compra compra = compraRepository.findById(compraId).orElse(null);
        if (compra == null) {
            return;
        }
        String destino = compra.getUsuario().getEmail();
        if (!activo) {
            log.info("Mail desactivado (zenoir.mail.activo=false): no se mandan las entradas de la compra {} a {}", compraId, destino);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper armado = new MimeMessageHelper(mensaje, true, "UTF-8"); // true = lleva imágenes adjuntas
            armado.setFrom(remitente, "Zenoir");
            armado.setTo(destino);
            armado.setSubject("Tus entradas de Zenoir");
            armado.setText(MailEntradas.html(compra.getUsuario().getFirstName(), entradas(compra), urlFront + "/mis-entradas"), true);
            // Cada QR se adjunta en línea con el nombre (cid) que usa el HTML. Va después de setText, como pide Spring.
            for (Ticket ticket : tickets(compra)) {
                byte[] qr = QrImagen.png(urlFront + "/verificar/" + ticket.getCodigoQr(), 440);
                armado.addInline("qr-" + ticket.getId(), new ByteArrayResource(qr), "image/png");
            }
            mailSender.send(mensaje);
            log.info("Se mandaron las entradas de la compra {} a {}", compraId, destino);
        } catch (Exception e) {
            log.error("No se pudo mandar el mail de la compra {} a {}", compraId, destino, e);
        }
    }

    private List<EntradaMail> entradas(Compra compra) {
        List<EntradaMail> entradas = new ArrayList<>();
        for (DetalleCompra detalle : compra.getDetalles()) {
            Evento evento = detalle.getEventoTipoEntrada().getEvento();
            for (Ticket ticket : detalle.getTickets()) {
                entradas.add(new EntradaMail("qr-" + ticket.getId(), evento.getTitulo(), fecha(evento.getFechaHoraInicio()),
                        evento.getLocacion().getNombre(), detalle.getEventoTipoEntrada().getTipoEntrada().getNombre(),
                        ticket.getCodigoQr().substring(0, 8).toUpperCase()));
            }
        }
        return entradas;
    }

    private List<Ticket> tickets(Compra compra) {
        return compra.getDetalles().stream().flatMap(detalle -> detalle.getTickets().stream()).toList();
    }

    // Ej.: "sábado 24 de octubre · 23:00 h", con la primera letra en mayúscula
    private String fecha(LocalDateTime inicio) {
        String texto = inicio.format(FECHA);
        return Character.toUpperCase(texto.charAt(0)) + texto.substring(1);
    }
}
