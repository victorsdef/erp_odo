package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PacienteRepositorio extends JpaRepository<Paciente, Long> {
    List<Paciente> findByActivoTrue();
    Optional<Paciente> findByDni(String dni);
    List<Paciente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
}
