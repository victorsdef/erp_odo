package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos_cuota")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoCuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_id", nullable = false)
    private Factura factura;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    private String notas;

    @Column(nullable = false, updatable = false)
    private LocalDateTime pagadoEn;

    @PrePersist
    void prePersist() { this.pagadoEn = LocalDateTime.now(); }
}
