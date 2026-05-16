package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Odontogram;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OdontogramRepository extends JpaRepository<Odontogram, Long> {
    Optional<Odontogram> findByPatientId(Long patientId);
}
