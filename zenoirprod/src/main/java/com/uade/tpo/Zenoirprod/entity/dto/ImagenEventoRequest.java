package com.uade.tpo.Zenoirprod.entity.dto;

import org.springframework.web.multipart.MultipartFile;

import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;

import lombok.Data;

@Data
public class ImagenEventoRequest {
    private MultipartFile archivo;
    private TipoImagenEvento tipoImagenEvento;
    private Integer orden;
    private String descripcion;
}
