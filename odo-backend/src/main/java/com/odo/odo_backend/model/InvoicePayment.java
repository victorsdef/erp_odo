package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoicePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paidAt;

    @PrePersist
    void prePersist() { this.paidAt = LocalDateTime.now(); }
}
