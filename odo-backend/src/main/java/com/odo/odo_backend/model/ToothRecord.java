package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tooth_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ToothRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontogram_id", nullable = false)
    private Odontogram odontogram;

    @Column(nullable = false)
    private Integer toothNumber;

    @Enumerated(EnumType.STRING)
    private Condition condition;

    private String treatment;
    private String notes;

    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum Condition {
        HEALTHY, CARIES, FILLED, CROWN, MISSING, ROOT_CANAL, EXTRACTED, BRIDGE, IMPLANT
    }
}
