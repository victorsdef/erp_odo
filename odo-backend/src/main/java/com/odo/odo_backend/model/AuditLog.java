package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;

    @Enumerated(EnumType.STRING)
    private User.Role userRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Action action;

    private String entityType;
    private String entityId;

    @Column(length = 500)
    private String description;

    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }

    public enum Action {
        LOGIN, LOGOUT,
        CREATE, UPDATE, DELETE,
        PAYMENT_REGISTERED, STATUS_CHANGED
    }
}
