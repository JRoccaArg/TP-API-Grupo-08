package com.uade.tpo.Zenoirprod;

import java.nio.file.Files;
import java.nio.file.Path;
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

	// La configuración propia de cada máquina (clave de SQL Server, mail) va en zenoirprod/config/application.properties. Se lee
	// sola si el editor ejecuta desde la carpeta zenoirprod; si ejecuta desde la raíz del repositorio, se le indica dónde está.
	private static final Path CONFIG_EN_ZENOIRPROD = Path.of("config", "application.properties");
	private static final Path CONFIG_EN_LA_RAIZ = Path.of("zenoirprod", "config", "application.properties");

	// Sin configuración de SQL Server (clave en el archivo de config o en DB_PASSWORD) ni un perfil elegido, la app arranca con la
	// base en memoria (perfil dev) en vez de fallar al conectarse: así levanta con el botón de ejecutar de cualquier editor.
	private static void usarBaseEnMemoriaSiNoHayClave() {
		if (Files.exists(CONFIG_EN_LA_RAIZ) && !Files.exists(CONFIG_EN_ZENOIRPROD)) {
			System.setProperty("spring.config.additional-location", "optional:file:./zenoirprod/config/");
		}
		boolean perfilElegido = hayValor(System.getenv("SPRING_PROFILES_ACTIVE")) || hayValor(System.getProperty("spring.profiles.active"));
		boolean sqlServerConfigurado = hayValor(System.getenv("DB_PASSWORD")) || hayValor(System.getenv("SPRING_DATASOURCE_URL"))
				|| Files.exists(CONFIG_EN_ZENOIRPROD) || Files.exists(CONFIG_EN_LA_RAIZ);
		if (!perfilElegido && !sqlServerConfigurado) {
			System.setProperty("spring.profiles.active", "dev");
			System.setProperty("zenoir.datos-demo", "true"); // carga el catálogo de ejemplo (DatosDemo)
			System.out.println("*** Sin configuración de SQL Server: se usa la base en memoria (perfil dev), los datos se pierden al apagar. "
					+ "Para SQL Server copiá la carpeta config dentro de zenoirprod (ver README). ***");
		}
	}

	private static boolean hayValor(String texto) {
		return texto != null && !texto.isBlank();
	}

}

