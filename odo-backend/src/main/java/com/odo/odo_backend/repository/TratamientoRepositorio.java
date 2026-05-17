package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Tratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TratamientoRepositorio extends JpaRepository<Tratamiento, Long> {
    List<Tratamiento> findByActivoTrue();
}
