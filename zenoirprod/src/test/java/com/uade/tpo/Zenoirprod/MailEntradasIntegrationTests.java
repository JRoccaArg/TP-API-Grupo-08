package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;
import com.uade.tpo.Zenoirprod.service.MailService;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

// Mail con las entradas: el envío real se reemplaza por uno simulado (@MockBean) y se revisa el mail que se armó.
// Sin @Transactional porque el mail se arma en otro hilo (@Async), que tiene que poder leer la compra ya guardada.
// Por eso los datos se borran a mano al terminar (la base H2 la comparten todas las clases de test).
@SpringBootTest
@ActiveProfiles("dev") // H2 en memoria, nunca la base real
@TestPropertySource(properties = { "zenoir.mail.activo=true", "zenoir.mail.remitente=zenoir@test.com" })
class MailEntradasIntegrationTests {

    @MockBean private JavaMailSender mailSender;
    @Autowired private MailService mailService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CompraRepository compraRepository;

    private Compra compra;
    private EventoTipoEntrada oferta;

    @AfterEach
    void borrarDatos() {
        if (compra == null) {
            return;
        }
        Evento evento = oferta.getEvento();
        compraRepository.delete(compra);
        eventoTipoEntradaRepository.delete(oferta);
        tipoEntradaRepository.delete(oferta.getTipoEntrada());
        eventosRepository.delete(evento);
        locationRepository.delete(evento.getLocacion());
        categoryRepository.delete(evento.getCategoria());
        userRepository.delete(compra.getUsuario());
    }

    @Test
    void alConfirmarUnaCompraSeMandaUnMailConUnQrPorEntrada() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));
        compra = guardarCompraConDosEntradas();

        mailService.enviarEntradas(compra.getId());

        ArgumentCaptor<MimeMessage> enviado = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(5000)).send(enviado.capture()); // espera al hilo del @Async
        MimeMessage mail = enviado.getValue();
        mail.saveChanges(); // completa las cabeceras (lo hace el envío real, que acá está simulado)
        assertEquals("lucia.mail.entradas@zenoir.test", mail.getAllRecipients()[0].toString());
        assertEquals("Tus entradas de Zenoir", mail.getSubject());

        List<Part> partes = new ArrayList<>();
        recorrer(mail, partes);
        String html = (String) partes.stream().filter(this::esHtml).findFirst().orElseThrow().getContent();
        assertTrue(html.contains("Gracias, Lucia"));
        assertTrue(html.contains("Noche del mail"));
        assertTrue(html.contains("cid:qr-"));
        long qrs = partes.stream().filter(this::esImagenEnLinea).count();
        assertEquals(2, qrs);
    }

    // Junta las partes finales del mail (el HTML y cada imagen), entrando en las que tienen otras adentro
    private void recorrer(Part parte, List<Part> hojas) throws Exception {
        if (parte.getContent() instanceof Multipart multipart) {
            for (int i = 0; i < multipart.getCount(); i++) {
                recorrer(multipart.getBodyPart(i), hojas);
            }
        } else {
            hojas.add(parte);
        }
    }

    private boolean esHtml(Part parte) {
        try {
            return parte.isMimeType("text/html");
        } catch (Exception e) {
            return false;
        }
    }

    private boolean esImagenEnLinea(Part parte) {
        try {
            return parte.isMimeType("image/png") && parte.getHeader("Content-ID") != null;
        } catch (Exception e) {
            return false;
        }
    }

    private Compra guardarCompraConDosEntradas() {
        User comprador = userRepository.save(User.builder().email("lucia.mail.entradas@zenoir.test").password("no-se-usa")
                .firstName("Lucia").lastName("Perez").dni("97770001").fechaNacimiento(LocalDate.of(1998, 5, 20))
                .role(Role.USER).fechaRegistro(FechaCatalogo.ahora()).activo(true).build());
        Category categoria = new Category();
        categoria.setNombre("Categoria del mail");
        categoria.setActivo(true);
        Locacion locacion = new Locacion();
        locacion.setNombre("Salon del mail");
        locacion.setDireccion("Calle 789");
        Evento evento = new Evento();
        evento.setTitulo("Noche del mail");
        evento.setDescripcion("Descripcion");
        evento.setEstado("ACTIVO");
        evento.setLocacion(locationRepository.save(locacion));
        evento.setCategoria(categoryRepository.save(categoria));
        evento.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(1));
        evento.setFechaHoraFin(FechaCatalogo.ahora().plusDays(1).plusHours(5));
        evento = eventosRepository.save(evento);

        TipoEntrada tipo = new TipoEntrada();
        tipo.setNombre("General del mail");
        tipo.setDescripcionBase("Descripcion");
        tipo.setActivo(true);
        oferta = new EventoTipoEntrada();
        oferta.setEvento(evento);
        oferta.setTipoEntrada(tipoEntradaRepository.save(tipo));
        oferta.setPrecio(new BigDecimal("18000.00"));
        oferta.setPorcentajeDescuento(BigDecimal.ZERO);
        oferta.setCantidadTotal(100);
        oferta.setCantidadDisponible(98);
        oferta.setFechaInicioVenta(FechaCatalogo.ahora().minusDays(5));
        oferta.setFechaFinVenta(FechaCatalogo.ahora().plusDays(1));
        oferta.setEstado(EstadoEventoTipoEntrada.ACTIVO);

        DetalleCompra detalle = new DetalleCompra();
        oferta = eventoTipoEntradaRepository.save(oferta);
        detalle.setEventoTipoEntrada(oferta);
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(new BigDecimal("18000.00"));
        detalle.setSubtotal(new BigDecimal("36000.00"));
        detalle.setTickets(new ArrayList<>(List.of(ticket(), ticket())));
        Compra compra = new Compra();
        compra.setUsuario(comprador);
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(FechaCatalogo.ahora());
        compra.setTotal(new BigDecimal("36000.00"));
        compra.setDetalles(new ArrayList<>(List.of(detalle)));
        return compraRepository.save(compra);
    }

    private Ticket ticket() {
        Ticket ticket = new Ticket();
        ticket.setCodigoQr(UUID.randomUUID().toString());
        ticket.setEstado(EstadoTicket.EMITIDO);
        ticket.setFechaEmision(FechaCatalogo.ahora());
        return ticket;
    }
}
