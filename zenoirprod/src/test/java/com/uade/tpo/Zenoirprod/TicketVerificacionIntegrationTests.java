package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.controllers.config.JwtService;
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
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

// Verificación de entradas por QR: el organizador (ADMIN) consulta un ticket y registra el ingreso
@SpringBootTest
@ActiveProfiles("dev") // H2 en memoria, nunca la base real
@AutoConfigureMockMvc
@Transactional // cada test deshace lo que crea
class TicketVerificacionIntegrationTests {

    private static final String CODIGO = "11111111-aaaa-bbbb-cccc-222222222222";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CompraRepository compraRepository;

    private String tokenAdmin;
    private String tokenComprador;

    @BeforeEach
    void armarCompra() {
        User admin = crearUsuario("admin.verificacion@zenoir.test", "90000001", "Ana", "Organizadora", Role.ADMIN);
        User comprador = crearUsuario("lucia.verificacion@zenoir.test", "90000002", "Lucia", "Perez", Role.USER);
        tokenAdmin = jwtService.generateToken(admin);
        tokenComprador = jwtService.generateToken(comprador);

        Evento evento = crearEvento();
        EventoTipoEntrada oferta = crearOferta(evento);

        Ticket ticket = new Ticket();
        ticket.setCodigoQr(CODIGO);
        ticket.setEstado(EstadoTicket.EMITIDO);
        ticket.setFechaEmision(FechaCatalogo.ahora());

        DetalleCompra detalle = new DetalleCompra();
        detalle.setEventoTipoEntrada(oferta);
        detalle.setCantidad(1);
        detalle.setPrecioUnitario(new BigDecimal("18000.00"));
        detalle.setSubtotal(new BigDecimal("18000.00"));
        detalle.setTickets(List.of(ticket));

        Compra compra = new Compra();
        compra.setUsuario(comprador);
        compra.setTotal(new BigDecimal("18000.00"));
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(FechaCatalogo.ahora());
        compra.setDetalles(List.of(detalle));
        compraRepository.save(compra);
    }

    @Test
    void consultarUnTicketValidoMuestraAQuienPerteneceYElEvento() throws Exception {
        mockMvc.perform(get("/tickets/qr/" + CODIGO).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoQr").value(CODIGO))
                .andExpect(jsonPath("$.estado").value("EMITIDO"))
                .andExpect(jsonPath("$.compradorNombre").value("Lucia Perez"))
                .andExpect(jsonPath("$.eventoTitulo").value("Noche de verificacion"))
                .andExpect(jsonPath("$.eventoFechaHoraInicio").isNotEmpty())
                .andExpect(jsonPath("$.locacionNombre").value("Salon de verificacion"))
                .andExpect(jsonPath("$.tipoEntradaNombre").value("General verificacion"))
                .andExpect(jsonPath("$.fechaUtilizacion").doesNotExist());
    }

    @Test
    void consultarNoGastaElTicketPeroUtilizarSi() throws Exception {
        mockMvc.perform(get("/tickets/qr/" + CODIGO).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(jsonPath("$.estado").value("EMITIDO"));

        mockMvc.perform(post("/tickets/qr/" + CODIGO + "/utilizar").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("UTILIZADO"))
                .andExpect(jsonPath("$.fechaUtilizacion").isNotEmpty())
                .andExpect(jsonPath("$.compradorNombre").value("Lucia Perez"));

        mockMvc.perform(get("/tickets/qr/" + CODIGO).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(jsonPath("$.estado").value("UTILIZADO"));
    }

    @Test
    void unTicketYaUtilizadoNoSePuedeUsarDeNuevo() throws Exception {
        mockMvc.perform(post("/tickets/qr/" + CODIGO + "/utilizar").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());

        mockMvc.perform(post("/tickets/qr/" + CODIGO + "/utilizar").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("ya fue usado")));
    }

    @Test
    void unCodigoQueNoExisteDevuelve404() throws Exception {
        mockMvc.perform(get("/tickets/qr/no-existe").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("El ticket no existe"));

        mockMvc.perform(post("/tickets/qr/no-existe/utilizar").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());
    }

    @Test
    void soloElAdminPuedeVerificarEntradas() throws Exception {
        mockMvc.perform(get("/tickets/qr/" + CODIGO))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/tickets/qr/" + CODIGO).header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/tickets/qr/" + CODIGO + "/utilizar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isForbidden());
    }

    private User crearUsuario(String email, String dni, String nombre, String apellido, Role rol) {
        return userRepository.save(User.builder()
                .email(email)
                .password("no-se-usa-en-esta-prueba")
                .firstName(nombre)
                .lastName(apellido)
                .dni(dni)
                .fechaNacimiento(LocalDate.of(1998, 5, 20))
                .role(rol)
                .fechaRegistro(FechaCatalogo.ahora())
                .activo(true)
                .build());
    }

    private Evento crearEvento() {
        Category categoria = new Category();
        categoria.setNombre("Categoria de verificacion");
        categoria.setActivo(true);
        categoria = categoryRepository.save(categoria);

        Locacion locacion = new Locacion();
        locacion.setNombre("Salon de verificacion");
        locacion.setDireccion("Calle 123");
        locacion = locationRepository.save(locacion);

        Evento evento = new Evento();
        evento.setTitulo("Noche de verificacion");
        evento.setDescripcion("Descripcion");
        evento.setEstado("ACTIVO");
        evento.setLocacion(locacion);
        evento.setCategoria(categoria);
        evento.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(1));
        evento.setFechaHoraFin(FechaCatalogo.ahora().plusDays(1).plusHours(5));
        return eventosRepository.save(evento);
    }

    private EventoTipoEntrada crearOferta(Evento evento) {
        TipoEntrada tipo = new TipoEntrada();
        tipo.setNombre("General verificacion");
        tipo.setDescripcionBase("Entrada general");
        tipo.setActivo(true);
        tipo = tipoEntradaRepository.save(tipo);

        EventoTipoEntrada oferta = new EventoTipoEntrada();
        oferta.setEvento(evento);
        oferta.setTipoEntrada(tipo);
        oferta.setPrecio(new BigDecimal("18000.00"));
        oferta.setPorcentajeDescuento(BigDecimal.ZERO);
        oferta.setCantidadTotal(100);
        oferta.setCantidadDisponible(99);
        oferta.setFechaInicioVenta(FechaCatalogo.ahora().minusDays(5));
        oferta.setFechaFinVenta(FechaCatalogo.ahora().plusDays(1));
        oferta.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        return eventoTipoEntradaRepository.save(oferta);
    }
}
