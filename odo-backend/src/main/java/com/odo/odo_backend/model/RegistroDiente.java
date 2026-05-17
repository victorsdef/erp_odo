package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_diente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroDiente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontograma_id", nullable = false)
    private Odontograma odontograma;

    @Column(nullable = false)
    private Integer numeroDiente;

    @Enumerated(EnumType.STRING)
    private Condicion condicion;

    private String tratamiento;
    private String notas;
    private LocalDateTime actualizadoEn;

    @PrePersist @PreUpdate
    void preUpdate() { this.actualizadoEn = LocalDateTime.now(); }

    public enum Condicion {
        HEALTHY, CARIES, FILLED, CROWN, MISSING, ROOT_CANAL, EXTRACTED, BRIDGE, IMPLANT
    }
}
