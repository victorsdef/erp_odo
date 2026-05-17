package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.UsuarioRequest;
import com.odo.odo_backend.dto.response.UsuarioRespuesta;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioRespuesta> obtenerTodos() {
        return usuarioRepositorio.findAll().stream()
                .map(UsuarioRespuesta::from).toList();
    }

    public UsuarioRespuesta obtenerPorId(Long id) {
        return UsuarioRespuesta.from(buscarPorId(id));
    }

    public UsuarioRespuesta crear(UsuarioRequest request) {
        if (usuarioRepositorio.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (request.getContrasena() == null || request.getContrasena().isBlank()) {
            throw new IllegalArgumentException("La contraseña es requerida al crear un usuario");
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .rol(request.getRol())
                .activo(true)
                .build();
        return UsuarioRespuesta.from(usuarioRepositorio.save(usuario));
    }

    public UsuarioRespuesta actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = buscarPorId(id);
        if (!usuario.getEmail().equals(request.getEmail()) && usuarioRepositorio.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso por otro usuario");
        }
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());
        if (request.getContrasena() != null && !request.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }
        return UsuarioRespuesta.from(usuarioRepositorio.save(usuario));
    }

    public UsuarioRespuesta alternarActivo(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(!usuario.isActivo());
        return UsuarioRespuesta.from(usuarioRepositorio.save(usuario));
    }

    private Usuario buscarPorId(Long id) {
        return usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
    }
}
