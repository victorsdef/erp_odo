package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "odontograms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Odontogram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    @OneToMany(mappedBy = "odontogram", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ToothRecord> teeth = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
