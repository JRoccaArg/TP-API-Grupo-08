package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.uade.tpo.Zenoirprod.util.QrImagen;

// El QR del mail guarda exactamente el link de verificación de la entrada
class QrImagenTest {

    @Test
    void laImagenDelQrSeLeeYGuardaElLinkDeLaEntrada() throws Exception {
        String link = "http://localhost:5173/verificar/6f9984a5-a340-49e3-849e-411d44c7b36e";

        byte[] png = QrImagen.png(link, 440);
        BufferedImage imagen = ImageIO.read(new ByteArrayInputStream(png));
        String leido = new MultiFormatReader()
                .decode(new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(imagen))))
                .getText();

        assertTrue(png.length > 0);
        assertEquals(440, imagen.getWidth());
        assertEquals(link, leido);
    }
}
