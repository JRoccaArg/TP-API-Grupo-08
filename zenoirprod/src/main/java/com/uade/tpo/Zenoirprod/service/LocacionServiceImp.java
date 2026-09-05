package com.uade.tpo.Zenoirprod.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.exceptions.LocacionEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;

@Service
public class LocacionServiceImp implements LocacionService {

    @Autowired
    private LocationRepository locacionRepository;

    /* Se usa solo para no borrar una locación que todavía tiene eventos */
    @Autowired
    private EventosRepository eventosRepository;

    public Page<Locacion> getLocaciones(PageRequest pageRequest) {
        return locacionRepository.findAll(pageRequest);
    }

    public Locacion getLocacionPorId(Integer id) throws LocacionInexsistenteException {
        return locacionRepository.findById(id)
                .orElseThrow(LocacionInexsistenteException::new);
    }

    public Locacion crearLocacion(String nombre, String direccion, Integer capacidadMax) {
        Locacion locacion = new Locacion();
        locacion.setNombre(nombre);
        locacion.setDireccion(direccion);
        locacion.setCapacidadMax(capacidadMax);
        return locacionRepository.save(locacion);
    }

    public Locacion updateLocacion(Integer id, String nombre, String direccion, Integer capacidadMax)
            throws LocacionInexsistenteException {
        Locacion locacion = getLocacionPorId(id);
        locacion.setNombre(nombre);
        locacion.setDireccion(direccion);
        locacion.setCapacidadMax(capacidadMax);
        return locacionRepository.save(locacion);
    }

    public void deleteLocacion(Integer id) throws LocacionInexsistenteException, LocacionEnUsoException {
        if (!locacionRepository.existsById(id)) {
            throw new LocacionInexsistenteException();
        }
        /* Evento.locacion es obligatorio: borrar acá rompería la FK */
        boolean enUso = eventosRepository.findAll().stream()
                .anyMatch(evento -> evento.getLocacion() != null && id.equals(evento.getLocacion().getId()));
        if (enUso) {
            throw new LocacionEnUsoException();
        }
        locacionRepository.deleteById(id);
    }
}
