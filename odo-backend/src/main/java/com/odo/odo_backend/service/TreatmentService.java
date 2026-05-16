package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.TreatmentRequest;
import com.odo.odo_backend.dto.response.TreatmentResponse;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.Treatment;
import com.odo.odo_backend.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentRepository treatmentRepository;

    public List<TreatmentResponse> getAll() {
        return treatmentRepository.findAll().stream().map(TreatmentResponse::from).toList();
    }

    public List<TreatmentResponse> getActive() {
        return treatmentRepository.findByActiveTrue().stream().map(TreatmentResponse::from).toList();
    }

    public TreatmentResponse create(TreatmentRequest req) {
        Treatment t = Treatment.builder()
                .name(req.getName())
                .description(req.getDescription())
                .defaultPrice(req.getDefaultPrice())
                .durationMinutes(req.getDurationMinutes())
                .build();
        return TreatmentResponse.from(treatmentRepository.save(t));
    }

    public TreatmentResponse update(Long id, TreatmentRequest req) {
        Treatment t = find(id);
        t.setName(req.getName());
        t.setDescription(req.getDescription());
        t.setDefaultPrice(req.getDefaultPrice());
        t.setDurationMinutes(req.getDurationMinutes());
        return TreatmentResponse.from(treatmentRepository.save(t));
    }

    public TreatmentResponse toggleActive(Long id) {
        Treatment t = find(id);
        t.setActive(!t.isActive());
        return TreatmentResponse.from(treatmentRepository.save(t));
    }

    public void delete(Long id) {
        treatmentRepository.delete(find(id));
    }

    private Treatment find(Long id) {
        return treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tratamiento no encontrado"));
    }
}
