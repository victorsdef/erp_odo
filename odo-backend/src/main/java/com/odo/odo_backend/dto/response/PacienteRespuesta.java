package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Paciente;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class PacienteRespuesta {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String email;
    private String direccion;
    private LocalDate fechaNacimiento;
    private String notas;
    private boolean activo;
    private LocalDateTime creadoEn;

    public static PacienteRespuesta from(Paciente p) {
        return PacienteRespuesta.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .dni(p.getDni())
                .telefono(p.getTelefono())
                .email(p.getEmail())
                .direccion(p.getDireccion())
                .fechaNacimiento(p.getFechaNacimiento())
                .notas(p.getNotas())
                .activo(p.isActivo())
                .creadoEn(p.getCreadoEn())
                .build();
    }
}
