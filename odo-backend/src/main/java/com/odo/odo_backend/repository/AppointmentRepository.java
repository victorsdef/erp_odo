package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDentistId(Long dentistId);
    List<Appointment> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByDentistIdAndDateTimeBetween(Long dentistId, LocalDateTime start, LocalDateTime end);
}
