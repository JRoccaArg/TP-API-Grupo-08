package com.uade.tpo.Zenoirprod.controllers.auth;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String dni;
    private LocalDate fechaNacimiento;
    private String email;
    private String password;
}
