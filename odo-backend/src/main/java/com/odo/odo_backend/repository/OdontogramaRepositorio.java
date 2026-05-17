package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Odontograma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OdontogramaRepositorio extends JpaRepository<Odontograma, Long> {
    Optional<Odontograma> findByPacienteId(Long pacienteId);
}
