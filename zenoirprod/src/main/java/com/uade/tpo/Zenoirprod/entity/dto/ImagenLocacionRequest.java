package com.uade.tpo.Zenoirprod.entity.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ImagenLocacionRequest {
    private MultipartFile archivo;
    private String textoAlternativo;
    private Integer orden;
}
