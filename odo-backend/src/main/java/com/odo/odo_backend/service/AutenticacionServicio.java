package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.LoginRequest;
import com.odo.odo_backend.dto.response.AutenticacionRespuesta;
import com.odo.odo_backend.dto.response.UsuarioRespuesta;
import com.odo.odo_backend.exception.NoAutorizadoExcepcion;
import com.odo.odo_backend.model.RegistroAuditoria;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import com.odo.odo_backend.security.UtilJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AutenticacionServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final UtilJwt utilJwt;
    private final RegistroAuditoriaServicio registroAuditoriaServicio;

    public AutenticacionRespuesta iniciarSesion(LoginRequest request, String ip, String agenteUsuario) {
        var usuario = usuarioRepositorio.findByEmail(request.getEmail())
                .orElseThrow(() -> new NoAutorizadoExcepcion("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new NoAutorizadoExcepcion("Credenciales inválidas");
        }

        if (!usuario.isActivo()) {
            throw new NoAutorizadoExcepcion("Usuario inactivo");
        }

        var auth = new UsernamePasswordAuthenticationToken(
                usuario.getEmail(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
        SecurityContextHolder.getContext().setAuthentication(auth);

        registroAuditoriaServicio.registrar(RegistroAuditoria.Accion.LOGIN, "Usuario",
                usuario.getId().toString(), "Inicio de sesión", ip, agenteUsuario);

        String token = utilJwt.generateToken(usuario.getEmail(), usuario.getRol().name());
        return AutenticacionRespuesta.builder()
                .token(token)
                .usuario(UsuarioRespuesta.from(usuario))
                .build();
    }
}
