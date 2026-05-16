package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.AppointmentRequest;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.Appointment;
import com.odo.odo_backend.repository.AppointmentRepository;
import com.odo.odo_backend.repository.PatientRepository;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada: " + id));
    }

    public Appointment create(AppointmentRequest request) {
        var patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        var dentist = userRepository.findById(request.getDentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentista no encontrado"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .dentist(dentist)
                .dateTime(request.getDateTime())
                .durationMinutes(request.getDurationMinutes())
                .reason(request.getReason())
                .notes(request.getNotes())
                .build();
        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long id, Appointment.Status status) {
        Appointment appointment = getById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public void delete(Long id) {
        appointmentRepository.deleteById(id);
    }
}
