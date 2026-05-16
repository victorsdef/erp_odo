package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "patients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String dni;

    private String phone;
    private String email;
    private String address;
    private LocalDate birthDate;
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    private Odontogram odontogram;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Invoice> invoices;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
