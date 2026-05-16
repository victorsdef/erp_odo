package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByActiveTrue();
}
