package com.uade.tpo.Zenoirprod.catalogo;

import static org.assertj.core.api.Assertions.*;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.TimeZone;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.dto.EventoResponse;
import com.uade.tpo.Zenoirprod.entity.dto.EventoTipoEntradaResponseDTO;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

class FechaCatalogoTest {
    @ParameterizedTest
    @ValueSource(strings = {"UTC", "America/Los_Angeles", "Asia/Tokyo"})
    void apiEntregaOffsetDeBuenosAiresIndependienteDeZonaDelServidor(String zona) throws Exception {
        TimeZone anterior = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone(zona));
            var inicio = LocalDateTime.of(2026,10,18,12,0);
            var fin = inicio.plusHours(1);
            var mapper = new ObjectMapper().findAndRegisterModules();
            Evento e = new Evento(); e.setFechaHoraInicio(inicio); e.setFechaHoraFin(fin);
            var evento = mapper.readTree(mapper.writeValueAsString(EventoResponse.fromEntity(e)));
            assertThat(evento.get("fechaHoraInicio").asText()).isEqualTo("2026-10-18T12:00-03:00");
            assertThat(evento.get("fechaHoraFin").asText()).isEqualTo("2026-10-18T13:00-03:00");
            var dto = EventoTipoEntradaResponseDTO.builder().fechaInicioVenta(inicio).fechaFinVenta(fin).build();
            var oferta = mapper.readTree(mapper.writeValueAsString(dto));
            assertThat(oferta.get("fechaInicioVenta").asText()).isEqualTo("2026-10-18T12:00-03:00");
            assertThat(oferta.get("fechaFinVenta").asText()).isEqualTo("2026-10-18T13:00-03:00");
            Instant antes = Instant.now().minusSeconds(1);
            assertThat(FechaCatalogo.ahora().atZone(FechaCatalogo.ZONA).toInstant())
                .isAfterOrEqualTo(antes).isBeforeOrEqualTo(Instant.now().plusSeconds(1));
        } finally {
            TimeZone.setDefault(anterior);
        }
    }
}
