package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepositorio extends JpaRepository<Cita, Long> {
    List<Cita> findByPacienteId(Long pacienteId);
    List<Cita> findByDentistaId(Long dentistaId);
    List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Cita> findByDentistaIdAndFechaHoraBetween(Long dentistaId, LocalDateTime inicio, LocalDateTime fin);
}
