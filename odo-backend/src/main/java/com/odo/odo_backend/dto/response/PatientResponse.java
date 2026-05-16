package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Patient;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class PatientResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String dni;
    private String phone;
    private String email;
    private String address;
    private LocalDate birthDate;
    private String notes;
    private LocalDateTime createdAt;

    public static PatientResponse from(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .dni(p.getDni())
                .phone(p.getPhone())
                .email(p.getEmail())
                .address(p.getAddress())
                .birthDate(p.getBirthDate())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
