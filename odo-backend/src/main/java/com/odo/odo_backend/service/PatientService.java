package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.PatientRequest;
import com.odo.odo_backend.dto.response.PatientResponse;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.Patient;
import com.odo.odo_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public List<PatientResponse> getAll() {
        return patientRepository.findByActiveTrue().stream()
                .map(PatientResponse::from).toList();
    }

    public PatientResponse getById(Long id) {
        return PatientResponse.from(findOrThrow(id));
    }

    public List<PatientResponse> search(String query) {
        return patientRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
                .stream().map(PatientResponse::from).toList();
    }

    public PatientResponse create(PatientRequest request) {
        Patient patient = Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dni(request.getDni())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .birthDate(request.getBirthDate())
                .notes(request.getNotes())
                .build();
        return PatientResponse.from(patientRepository.save(patient));
    }

    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = findOrThrow(id);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDni(request.getDni());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setBirthDate(request.getBirthDate());
        patient.setNotes(request.getNotes());
        return PatientResponse.from(patientRepository.save(patient));
    }

    public void delete(Long id) {
        Patient patient = findOrThrow(id);
        patient.setActive(false);
        patientRepository.save(patient);
    }

    private Patient findOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado: " + id));
    }
}
