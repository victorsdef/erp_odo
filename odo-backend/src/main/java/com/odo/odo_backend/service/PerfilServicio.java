package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.PerfilRequest;
import com.odo.odo_backend.dto.response.UsuarioRespuesta;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PerfilServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder    passwordEncoder;
    private final MinioServicio      minioServicio;

    public UsuarioRespuesta obtenerPerfil() {
        return UsuarioRespuesta.from(usuarioActual());
    }

    public UsuarioRespuesta actualizarPerfil(PerfilRequest request) {
        Usuario usuario = usuarioActual();

        if (!usuario.getEmail().equals(request.getEmail()) && usuarioRepositorio.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso por otro usuario");
        }

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());

        if (request.getNuevaContrasena() != null && !request.getNuevaContrasena().isBlank()) {
            if (!usuario.isDebeActualizarContrasena()) {
                if (request.getContrasenaActual() == null || request.getContrasenaActual().isBlank()) {
                    throw new IllegalArgumentException("Debes ingresar tu contraseña actual para cambiarla");
                }
                if (!passwordEncoder.matches(request.getContrasenaActual(), usuario.getContrasena())) {
                    throw new IllegalArgumentException("La contraseña actual es incorrecta");
                }
            }
            usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
            usuario.setDebeActualizarContrasena(false);
        }

        return UsuarioRespuesta.from(usuarioRepositorio.save(usuario));
    }

    public UsuarioRespuesta actualizarFoto(MultipartFile archivo) throws Exception {
        Usuario usuario  = usuarioActual();
        String  filename = minioServicio.subirFoto(archivo);
        String  nombre   = filename.substring(filename.lastIndexOf('/') + 1);
        usuario.setFotoPerfil(nombre);
        return UsuarioRespuesta.from(usuarioRepositorio.save(usuario));
    }

    private Usuario usuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
    }
}
