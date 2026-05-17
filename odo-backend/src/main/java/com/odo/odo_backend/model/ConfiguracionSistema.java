package com.odo.odo_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuracion_sistema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionSistema {

    @Id
    private Long id;

    private String nombre;

    @Column(name = "logo_archivo")
    private String logoArchivo;
}
