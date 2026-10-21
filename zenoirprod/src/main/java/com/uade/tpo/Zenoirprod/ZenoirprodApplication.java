package com.uade.tpo.Zenoirprod;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

@SpringBootApplication
@EnableScheduling
@EnableAsync // el mail de las entradas se manda en segundo plano (@Async)
public class ZenoirprodApplication {

	public static void main(String[] args) {
		// Toda la app trabaja en hora de Buenos Aires, sin importar la zona de la máquina
		TimeZone.setDefault(TimeZone.getTimeZone(FechaCatalogo.ZONA));
		usarBaseEnMemoriaSiNoHayClave();
		SpringApplication.run(ZenoirprodApplication.class, args);
	}

	// Sin clave de SQL Server (DB_PASSWORD) ni un perfil elegido, la app arranca con la base en memoria (perfil dev) en vez de
	// fallar al conectarse: así levanta con el botón de ejecutar de cualquier editor. Con la clave definida usa SQL Server.
	private static void usarBaseEnMemoriaSiNoHayClave() {
		boolean perfilElegido = hayValor(System.getenv("SPRING_PROFILES_ACTIVE")) || hayValor(System.getProperty("spring.profiles.active"));
		boolean sqlServerConfigurado = hayValor(System.getenv("DB_PASSWORD")) || hayValor(System.getenv("SPRING_DATASOURCE_URL"));
		if (!perfilElegido && !sqlServerConfigurado) {
			System.setProperty("spring.profiles.active", "dev");
			System.setProperty("zenoir.datos-demo", "true"); // carga el catálogo de ejemplo (DatosDemo)
			System.out.println("*** Sin DB_PASSWORD: se usa la base en memoria (perfil dev), los datos se pierden al apagar. "
					+ "Para SQL Server definí DB_PASSWORD (ver README). ***");
		}
	}

	private static boolean hayValor(String texto) {
		return texto != null && !texto.isBlank();
	}

}

