package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pacientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(unique = true)
    private String dni;

    private String telefono;
    private String email;
    private String direccion;
    private LocalDate fechaNacimiento;
    private String notas;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL)
    private List<Cita> citas;

    @OneToOne(mappedBy = "paciente", cascade = CascadeType.ALL)
    private Odontograma odontograma;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL)
    private List<Factura> facturas;

    @PrePersist
    void prePersist() { this.creadoEn = LocalDateTime.now(); }
}
