package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.CitaRequest;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Cita;
import com.odo.odo_backend.repository.CitaRepositorio;
import com.odo.odo_backend.repository.PacienteRepositorio;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaServicio {

    private final CitaRepositorio citaRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public List<Cita> obtenerTodas() {
        return citaRepositorio.findAll();
    }

    public List<Cita> obtenerPorPaciente(Long pacienteId) {
        return citaRepositorio.findByPacienteId(pacienteId);
    }

    public Cita obtenerPorId(Long id) {
        return citaRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cita no encontrada: " + id));
    }

    public Cita crear(CitaRequest request) {
        var paciente = pacienteRepositorio.findById(request.getPacienteId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Paciente no encontrado"));
        var dentista = usuarioRepositorio.findById(request.getDentistaId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Dentista no encontrado"));

        Cita cita = Cita.builder()
                .paciente(paciente)
                .dentista(dentista)
                .fechaHora(request.getFechaHora())
                .duracionMinutos(request.getDuracionMinutos())
                .motivo(request.getMotivo())
                .notas(request.getNotas())
                .build();
        return citaRepositorio.save(cita);
    }

    public Cita actualizarEstado(Long id, Cita.Estado estado) {
        Cita cita = obtenerPorId(id);
        cita.setEstado(estado);
        return citaRepositorio.save(cita);
    }

    public void eliminar(Long id) {
        citaRepositorio.deleteById(id);
    }
}
