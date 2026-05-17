package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "odontogramas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Odontograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false, unique = true)
    private Paciente paciente;

    @OneToMany(mappedBy = "odontograma", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RegistroDiente> dientes = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime creadoEn;

    private LocalDateTime actualizadoEn;

    @PrePersist
    void prePersist() { this.creadoEn = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate() { this.actualizadoEn = LocalDateTime.now(); }
}
