package com.uade.tpo.Zenoirprod;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZenoirprodApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZenoirprodApplication.class, args);
	}

}

