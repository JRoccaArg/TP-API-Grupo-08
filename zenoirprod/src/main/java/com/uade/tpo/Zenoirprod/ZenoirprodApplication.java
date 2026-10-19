package com.uade.tpo.Zenoirprod;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

@SpringBootApplication
@EnableScheduling
public class ZenoirprodApplication {

	public static void main(String[] args) {
		// Toda fecha y hora del sistema es la de Buenos Aires, sin importar en qué zona esté configurada la máquina.
		TimeZone.setDefault(TimeZone.getTimeZone(FechaCatalogo.ZONA));
		SpringApplication.run(ZenoirprodApplication.class, args);
	}

}

