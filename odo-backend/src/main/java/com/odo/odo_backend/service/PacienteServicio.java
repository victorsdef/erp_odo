package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.PacienteRequest;
import com.odo.odo_backend.dto.response.PacienteRespuesta;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Paciente;
import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.PacienteRepositorio;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteServicio {

    private final PacienteRepositorio pacienteRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    public List<PacienteRespuesta> obtenerTodos() {
        return pacienteRepositorio.findByActivoTrue().stream()
                .map(PacienteRespuesta::from).toList();
    }

    public PacienteRespuesta obtenerPorId(Long id) {
        return PacienteRespuesta.from(buscarOLanzar(id));
    }

    public List<PacienteRespuesta> buscar(String consulta) {
        return pacienteRepositorio.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(consulta, consulta)
                .stream().map(PacienteRespuesta::from).toList();
    }

    public PacienteRespuesta crear(PacienteRequest request) {
        Paciente paciente = Paciente.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .fechaNacimiento(request.getFechaNacimiento())
                .notas(request.getNotas())
                .build();
        Paciente guardado = pacienteRepositorio.save(paciente);

        String email = request.getEmail();
        String dni   = request.getDni();
        if (email != null && !email.isBlank() && dni != null && !dni.isBlank()
                && !usuarioRepositorio.existsByEmail(email)) {
            Usuario usuario = Usuario.builder()
                    .email(email)
                    .nombre(request.getNombre() + " " + request.getApellido())
                    .contrasena(passwordEncoder.encode(dni))
                    .rol(Usuario.Rol.PATIENT)
                    .debeActualizarContrasena(true)
                    .pacienteId(guardado.getId())
                    .build();
            usuarioRepositorio.save(usuario);
        }

        return PacienteRespuesta.from(guardado);
    }

    public PacienteRespuesta actualizar(Long id, PacienteRequest request) {
        Paciente paciente = buscarOLanzar(id);
        paciente.setNombre(request.getNombre());
        paciente.setApellido(request.getApellido());
        paciente.setDni(request.getDni());
        paciente.setTelefono(request.getTelefono());
        paciente.setEmail(request.getEmail());
        paciente.setDireccion(request.getDireccion());
        paciente.setFechaNacimiento(request.getFechaNacimiento());
        paciente.setNotas(request.getNotas());
        return PacienteRespuesta.from(pacienteRepositorio.save(paciente));
    }

    public void eliminar(Long id) {
        Paciente paciente = buscarOLanzar(id);
        paciente.setActivo(false);
        pacienteRepositorio.save(paciente);
    }

    private Paciente buscarOLanzar(Long id) {
        return pacienteRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Paciente no encontrado: " + id));
    }
}
