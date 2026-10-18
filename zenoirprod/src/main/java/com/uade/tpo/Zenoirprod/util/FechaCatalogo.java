package com.uade.tpo.Zenoirprod.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.io.IOException;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

// Las fechas de eventos y ventas almacenadas sin zona son horarios de Buenos Aires.
public final class FechaCatalogo extends JsonSerializer<LocalDateTime> {
    public static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    public static LocalDateTime ahora() {
        return LocalDateTime.now(ZONA);
    }

    @Override
    public void serialize(LocalDateTime valor, JsonGenerator generador, SerializerProvider proveedor) throws IOException {
        generador.writeString(valor.atZone(ZONA).toOffsetDateTime().toString());
    }
}
