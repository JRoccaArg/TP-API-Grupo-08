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
		SpringApplication.run(ZenoirprodApplication.class, args);
	}

}

