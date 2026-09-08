package com.uade.tpo.Zenoirprod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

@Component
public class TestFixtures {

    public static final String EMAIL_COMPRADOR = "comprador@test.com";

    @Autowired private CompraRepository compraRepository;
    @Autowired private CarritoRepository carritoRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;

    public static class Escenario {
        public Integer usuarioId;
        public String usuarioEmail;
        public Integer eventoId;
        public Integer eteId;
    }

    public void limpiar() {
        compraRepository.deleteAll();
        carritoRepository.deleteAll();
        eventoTipoEntradaRepository.deleteAll();
        eventosRepository.deleteAll();
        tipoEntradaRepository.deleteAll();
        locationRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    public Escenario crearEscenarioBase() {
        Escenario e = new Escenario();

        User usuario = crearUsuario(EMAIL_COMPRADOR, Role.USER);
        e.usuarioId = usuario.getId();
        e.usuarioEmail = usuario.getEmail();

        Evento evento = crearEvento("Fiesta Zenoir", "ACTIVO");
        e.eventoId = evento.getId();

        e.eteId = crearTipoEntradaParaEvento(
                evento, "VIP", new BigDecimal("15000.00"), new BigDecimal("10.00"), 100);

        return e;
    }

    public User crearUsuario(String email, Role role) {
        return userRepository.save(User.builder()
                .email(email)
                .password("secret")
                .firstName("Test")
                .lastName("User")
                .dni("DNI-" + System.nanoTime())
                .fechaNacimiento(LocalDate.of(2000, 1, 1))
                .role(role)
                .fechaRegistro(LocalDateTime.now())
                .activo(true)
                .build());
    }

    public Evento crearEvento(String titulo, String estado) {
        Locacion locacion = new Locacion();
        locacion.setNombre("Groove");
        locacion.setDireccion("Av. Santa Fe 4389");
        locacion.setCapacidadMax(500);
        locacion = locationRepository.save(locacion);

        Category categoria = categoryRepository.save(new Category("techno-" + System.nanoTime(), true));

        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion("Techno all night");
        evento.setEstado(estado);
        evento.setLocacion(locacion);
        evento.setCategoria(categoria);
        evento.setFechaHoraInicio(LocalDateTime.now().plusDays(30));
        evento.setFechaHoraFin(LocalDateTime.now().plusDays(30).plusHours(7));
        return eventosRepository.save(evento);
    }

    public Integer crearTipoEntradaParaEvento(Evento evento, String nombreTipo,
            BigDecimal precio, BigDecimal porcentajeDescuento, int stock) {
        TipoEntrada tipo = new TipoEntrada();
        tipo.setNombre(nombreTipo + "-" + System.nanoTime());
        tipo.setDescripcionBase("Acceso " + nombreTipo);
        tipo.setActivo(true);
        tipo = tipoEntradaRepository.save(tipo);

        EventoTipoEntrada ete = new EventoTipoEntrada();
        ete.setEvento(evento);
        ete.setTipoEntrada(tipo);
        ete.setPrecio(precio);
        ete.setPorcentajeDescuento(porcentajeDescuento);
        ete.setCantidadTotal(stock);
        ete.setCantidadDisponible(stock);
        ete.setFechaInicioVenta(LocalDateTime.now().minusDays(1));
        ete.setFechaFinVenta(LocalDateTime.now().plusDays(20));
        ete.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        return eventoTipoEntradaRepository.save(ete).getId();
    }

    public void cancelarEvento(Integer eventoId) {
        Evento evento = eventosRepository.findById(eventoId).orElseThrow();
        evento.setEstado("CANCELADO");
        eventosRepository.save(evento);
    }

    public Carrito crearCarrito(User usuario) {
        Carrito carrito = new Carrito();
        carrito.setUsuario(usuario);
        carrito.setEstado(EstadoCarrito.ACTIVO);
        carrito.setFechaCreacion(LocalDateTime.now());
        carrito.setFechaActualizacion(LocalDateTime.now());
        return carritoRepository.save(carrito);
    }

    public Carrito getCarrito(Integer id) {
        return carritoRepository.findById(id).orElseThrow();
    }

    public EventoTipoEntrada getTipoEntrada(Integer eteId) {
        return eventoTipoEntradaRepository.findById(eteId).orElseThrow();
    }

    public void guardarTipoEntrada(EventoTipoEntrada ete) {
        eventoTipoEntradaRepository.save(ete);
    }
}
