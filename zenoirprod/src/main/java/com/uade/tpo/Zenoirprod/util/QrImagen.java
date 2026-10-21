package com.uade.tpo.Zenoirprod.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

// Dibuja un QR como imagen PNG con ZXing (la libreria de Google para QR en Java). Se usa en el mail de las entradas.
public final class QrImagen {

    private QrImagen() {
    }

    // "texto" es lo que guarda el QR (el link de verificacion de la entrada) y "lado" el tamaño en pixeles.
    public static byte[] png(String texto, int lado) {
        try {
            BitMatrix matriz = new QRCodeWriter().encode(texto, BarcodeFormat.QR_CODE, lado, lado,
                    Map.of(EncodeHintType.MARGIN, 2)); // borde blanco alrededor: ayuda a que se escanee bien
            ByteArrayOutputStream imagen = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matriz, "PNG", imagen);
            return imagen.toByteArray();
        } catch (WriterException | IOException e) {
            throw new IllegalStateException("No se pudo generar la imagen del QR", e);
        }
    }
}
