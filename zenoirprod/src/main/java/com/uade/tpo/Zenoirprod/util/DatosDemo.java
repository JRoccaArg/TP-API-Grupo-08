package com.uade.tpo.Zenoirprod.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

// Datos de ejemplo para la base en memoria: solo se cargan cuando la app arrancó sin SQL Server (ver ZenoirprodApplication)
// y la base está vacía. Con SQL Server el catálogo sale de la seed. Dejan listo un administrador y un comprador para probar.
@Component
@ConditionalOnProperty(name = "zenoir.datos-demo", havingValue = "true")
public class DatosDemo implements CommandLineRunner {

    private final EventosRepository eventos;
    private final LocationRepository locaciones;
    private final CategoryRepository categorias;
    private final TipoEntradaRepository tipos;
    private final EventoTipoEntradaRepository ofertas;
    private final UserRepository usuarios;
    private final PasswordEncoder codificador;

    public DatosDemo(EventosRepository eventos, LocationRepository locaciones, CategoryRepository categorias,
            TipoEntradaRepository tipos, EventoTipoEntradaRepository ofertas, UserRepository usuarios,
            PasswordEncoder codificador) {
        this.eventos = eventos;
        this.locaciones = locaciones;
        this.categorias = categorias;
        this.tipos = tipos;
        this.ofertas = ofertas;
        this.usuarios = usuarios;
        this.codificador = codificador;
    }

    @Override
    public void run(String... args) {
        if (eventos.count() > 0) {
            return;
        }
        Locacion balcarce = locacion("Palacio Balcarce", "Av. Quintana 161, Recoleta, CABA");
        Locacion italiano = locacion("Círculo Italiano de Buenos Aires", "Libertad 1264, CABA");
        Category fiesta = categoria("Fiesta");
        Category after = categoria("After");
        Category gala = categoria("Gala");
        TipoEntrada general = tipo("General", "Acceso general");
        TipoEntrada vip = tipo("VIP", "Acceso VIP con barra libre");
        TipoEntrada preventa = tipo("Preventa", "Preventa con descuento");

        evento("After Palace", "Una noche de barra libre en el Palacio Balcarce.", "ACTIVO", balcarce, fiesta, 3, general, vip, preventa);
        evento("Haunted Edition", "La edición más oscura de Zenoir.", "ACTIVO", italiano, after, 10, general, vip, preventa);
        evento("Masquerade Edition", "Noche de máscaras y vestimenta de gala.", "ACTIVO", balcarce, gala, 17, general, vip, preventa);
        evento("Moonlit Garden", "Jardín, música en vivo y luces.", "ACTIVO", italiano, fiesta, 24, general, vip, preventa);
        evento("Velvet Ritual", "Un ritual de terciopelo y electrónica.", "ACTIVO", balcarce, after, 31, general, vip, preventa);
        evento("Golden Edition", "La edición dorada, ya finalizada.", "FINALIZADO", balcarce, gala, -40, general, vip, null);
        evento("Frosted Palace", "Una noche helada en el palacio, ya finalizada.", "FINALIZADO", balcarce, fiesta, -20, general, null, null);

        usuario("admin@zenoir.com", "Admin", "Zenoir", "30000001", "Admin#2026ok", Role.ADMIN);
        usuario("usuario@zenoir.com", "Usuario", "Zenoir", "30000002", "Usuario#2026ok", Role.USER);
        System.out.println("*** Datos de ejemplo cargados. Administrador: admin@zenoir.com / Admin#2026ok. "
                + "Comprador: usuario@zenoir.com / Usuario#2026ok ***");
    }

    private Locacion locacion(String nombre, String direccion) {
        Locacion locacion = new Locacion();
        locacion.setNombre(nombre);
        locacion.setDireccion(direccion);
        return locaciones.save(locacion);
    }

    private Category categoria(String nombre) {
        Category categoria = new Category();
        categoria.setNombre(nombre);
        categoria.setActivo(true);
        return categorias.save(categoria);
    }

    private TipoEntrada tipo(String nombre, String descripcion) {
        TipoEntrada tipo = new TipoEntrada();
        tipo.setNombre(nombre);
        tipo.setDescripcionBase(descripcion);
        tipo.setActivo(true);
        return tipos.save(tipo);
    }

    // "dias" es cuántos días faltan para el evento (negativo si ya pasó). Dura 6 horas, de 23 a 5.
    private void evento(String titulo, String descripcion, String estado, Locacion locacion, Category categoria, int dias,
            TipoEntrada general, TipoEntrada vip, TipoEntrada preventa) {
        LocalDateTime inicio = FechaCatalogo.ahora().toLocalDate().plusDays(dias).atTime(23, 0);
        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion(descripcion);
        evento.setEstado(estado);
        evento.setLocacion(locacion);
        evento.setCategoria(categoria);
        evento.setFechaHoraInicio(inicio);
        evento.setFechaHoraFin(inicio.plusHours(6));
        evento = eventos.save(evento);
        oferta(evento, general, "15000", "0", 200);
        if (vip != null) {
            oferta(evento, vip, "35000", "0", 40);
        }
        if (preventa != null) {
            oferta(evento, preventa, "9000", "20", 30);
        }
    }

    private void oferta(Evento evento, TipoEntrada tipo, String precio, String descuento, int cupo) {
        EventoTipoEntrada oferta = new EventoTipoEntrada();
        oferta.setEvento(evento);
        oferta.setTipoEntrada(tipo);
        oferta.setPrecio(new BigDecimal(precio));
        oferta.setPorcentajeDescuento(new BigDecimal(descuento));
        oferta.setCantidadTotal(cupo);
        oferta.setCantidadDisponible(cupo);
        oferta.setFechaInicioVenta(FechaCatalogo.ahora().minusDays(1));
        oferta.setFechaFinVenta(evento.getFechaHoraFin());
        oferta.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        ofertas.save(oferta);
    }

    private void usuario(String email, String nombre, String apellido, String dni, String clave, Role rol) {
        usuarios.save(User.builder().email(email).password(codificador.encode(clave)).firstName(nombre).lastName(apellido)
                .dni(dni).fechaNacimiento(LocalDate.of(1990, 1, 1)).role(rol).fechaRegistro(FechaCatalogo.ahora()).activo(true).build());
    }
}
