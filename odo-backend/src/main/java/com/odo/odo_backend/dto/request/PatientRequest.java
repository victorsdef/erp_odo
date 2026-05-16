package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String dni;
    private String phone;
    private String email;
    private String address;
    private LocalDate birthDate;
    private String notes;
}
