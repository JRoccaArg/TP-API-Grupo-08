package com.uade.tpo.Zenoirprod.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaDuplicadoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInvalidoException;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;

@Service
public class TipoEntradaServiceImp implements TipoEntradaService {

    @Autowired
    private TipoEntradaRepository tipoEntradaRepository;

    @Autowired
    private EventoTipoEntradaRepository eventoTipoEntradaRepository;

    public Page<TipoEntrada> getTiposEntrada(PageRequest pageRequest) {
        return tipoEntradaRepository.findAll(pageRequest);
    }

    public TipoEntrada getTipoEntradaPorId(Integer id) throws TipoEntradaInexistenteException {
        return tipoEntradaRepository.findById(id)
                .orElseThrow(TipoEntradaInexistenteException::new);
    }

    public TipoEntrada crearTipoEntrada(String nombre, String descripcionBase, Boolean activo)
            throws TipoEntradaInvalidoException, TipoEntradaDuplicadoException {
        validarDatos(nombre, descripcionBase);
        if (tipoEntradaRepository.existsByNombreIgnoreCase(nombre.trim())) {
            throw new TipoEntradaDuplicadoException();
        }
        TipoEntrada tipoEntrada = new TipoEntrada();
        tipoEntrada.setNombre(nombre.trim());
        tipoEntrada.setDescripcionBase(descripcionBase.trim());
        /* Si no mandan activo, queda en true (tipo habilitado) */
        tipoEntrada.setActivo(activo != null ? activo : true);
        return tipoEntradaRepository.save(tipoEntrada);
    }

    public TipoEntrada updateTipoEntrada(Integer id, String nombre, String descripcionBase, Boolean activo)
            throws TipoEntradaInexistenteException, TipoEntradaInvalidoException, TipoEntradaDuplicadoException {
        TipoEntrada tipoEntrada = getTipoEntradaPorId(id);
        validarDatos(nombre, descripcionBase);
        if (tipoEntradaRepository.existsByNombreIgnoreCaseAndIdNot(nombre.trim(), id)) {
            throw new TipoEntradaDuplicadoException();
        }
        tipoEntrada.setNombre(nombre.trim());
        tipoEntrada.setDescripcionBase(descripcionBase.trim());
        tipoEntrada.setActivo(activo != null ? activo : tipoEntrada.getActivo());
        return tipoEntradaRepository.save(tipoEntrada);
    }

    public void deleteTipoEntrada(Integer id)
            throws TipoEntradaInexistenteException, TipoEntradaEnUsoException {
        if (!tipoEntradaRepository.existsById(id)) {
            throw new TipoEntradaInexistenteException();
        }
        if (eventoTipoEntradaRepository.existsByTipoEntrada_Id(id)) {
            throw new TipoEntradaEnUsoException();
        }
        tipoEntradaRepository.deleteById(id);
    }

    private void validarDatos(String nombre, String descripcionBase)
            throws TipoEntradaInvalidoException {
        if (nombre == null || nombre.isBlank()
                || descripcionBase == null || descripcionBase.isBlank()) {
            throw new TipoEntradaInvalidoException();
        }
    }
}
