package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_auditoria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;
    private String usuarioNombre;

    @Enumerated(EnumType.STRING)
    private Usuario.Rol usuarioRol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Accion accion;

    private String tipoEntidad;
    private String idEntidad;

    @Column(length = 500)
    private String descripcion;

    private String direccionIp;

    @Column(length = 500)
    private String agenteUsuario;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void prePersist() { this.creadoEn = LocalDateTime.now(); }

    public enum Accion {
        LOGIN, LOGOUT,
        CREATE, UPDATE, DELETE,
        PAYMENT_REGISTERED, STATUS_CHANGED
    }
}
