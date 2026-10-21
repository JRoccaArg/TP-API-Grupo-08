package com.uade.tpo.Zenoirprod.util;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

// Revisa que un archivo subido sea de verdad una imagen (JPG, PNG o WEBP) y no pese mas de lo permitido: no alcanza con
// confiar en el tipo que declara el cliente, asi que se mira tambien como empiezan sus bytes.
public final class Imagenes {

    public static final long TAMANO_MAXIMO = 10L * 1024 * 1024;
    public static final String MENSAJE = "El archivo tiene que ser una imagen JPG, PNG o WEBP de hasta 10 MB";

    private Imagenes() {
    }

    public static boolean esValida(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty() || archivo.getSize() > TAMANO_MAXIMO) {
            return false;
        }
        String tipo = archivo.getContentType();
        if (tipo == null) {
            return false;
        }
        try {
            byte[] inicio = archivo.getInputStream().readNBytes(12);
            return switch (tipo.toLowerCase()) {
                case "image/jpeg", "image/jpg" -> empieza(inicio, 0xFF, 0xD8, 0xFF);
                case "image/png" -> empieza(inicio, 0x89, 0x50, 0x4E, 0x47);
                case "image/webp" -> empieza(inicio, 'R', 'I', 'F', 'F') && inicio.length >= 12
                        && inicio[8] == 'W' && inicio[9] == 'E' && inicio[10] == 'B' && inicio[11] == 'P';
                default -> false;
            };
        } catch (IOException e) {
            return false;
        }
    }

    private static boolean empieza(byte[] bytes, int... esperados) {
        if (bytes.length < esperados.length) {
            return false;
        }
        for (int i = 0; i < esperados.length; i++) {
            if ((bytes[i] & 0xFF) != esperados[i]) {
                return false;
            }
        }
        return true;
    }
}
