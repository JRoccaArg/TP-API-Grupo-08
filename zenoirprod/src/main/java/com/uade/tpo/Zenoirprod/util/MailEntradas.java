package com.uade.tpo.Zenoirprod.util;

import java.util.List;

import org.springframework.web.util.HtmlUtils;

// Arma el HTML del mail con las entradas de una compra (estetica de Zenoir: negro y dorado).
// Los mails se ven en clientes muy distintos (Gmail, Outlook, el celular): por eso se usan tablas y estilos en linea.
// Cada QR va como imagen adjunta "en linea": en el HTML se la nombra con "cid:<id>" (ver MailServiceImpl).
public final class MailEntradas {

    // Lo que se muestra de cada entrada. "cid" es el nombre con el que se adjunta la imagen de su QR.
    public record EntradaMail(String cid, String evento, String fecha, String lugar, String tipo, String codigo) {
    }

    private MailEntradas() {
    }

    public static String html(String comprador, List<EntradaMail> entradas, String urlMisEntradas) {
        StringBuilder tarjetas = new StringBuilder();
        for (EntradaMail entrada : entradas) {
            tarjetas.append("""
                    <tr><td style="padding:0 0 24px">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #5c4d2c;border-radius:18px">
                        <tr><td style="padding:24px 24px 8px;text-align:center">
                          <p style="margin:0;color:#d8bc78;font-size:12px;letter-spacing:3px">ENTRADA %s</p>
                          <p style="margin:8px 0 4px;color:#ffffff;font-size:24px;font-weight:bold">%s</p>
                          <p style="margin:0;color:#b5b5b5;font-size:14px">%s<br>%s</p>
                        </td></tr>
                        <tr><td style="padding:16px 24px;text-align:center">
                          <img src="cid:%s" width="220" height="220" alt="QR de la entrada" style="display:block;margin:0 auto;border-radius:12px">
                          <p style="margin:12px 0 0;color:#8c8c8c;font-size:12px;letter-spacing:2px">C&Oacute;DIGO %s</p>
                        </td></tr>
                      </table>
                    </td></tr>
                    """.formatted(texto(entrada.tipo().toUpperCase()), texto(entrada.evento()), texto(entrada.fecha()),
                    texto(entrada.lugar()), entrada.cid(), texto(entrada.codigo())));
        }
        return """
                <html><body style="margin:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0a"><tr><td align="center" style="padding:32px 16px">
                    <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px">
                      <tr><td style="padding:0 0 8px;color:#ffffff;font-size:30px;font-weight:bold">zenoir<span style="color:#d8bc78">.</span></td></tr>
                      <tr><td style="padding:0 0 24px;color:#ffffff;font-size:18px">Gracias, %s. Estas son tus entradas.
                        <br><span style="color:#b5b5b5;font-size:14px">Mostr&aacute; el QR en la puerta: cada c&oacute;digo se usa una sola vez.</span></td></tr>
                      %s
                      <tr><td align="center" style="padding:8px 0 0">
                        <a href="%s" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#d8bc78;color:#1b1407;font-weight:bold;text-decoration:none;letter-spacing:1px">VER MIS ENTRADAS</a>
                      </td></tr>
                    </table>
                  </td></tr></table>
                </body></html>
                """.formatted(texto(comprador), tarjetas, urlMisEntradas);
    }

    // Los datos que vienen de la base (nombre, titulo del evento) se escapan para que no rompan el HTML.
    private static String texto(String valor) {
        return HtmlUtils.htmlEscape(valor == null ? "" : valor);
    }
}
