package com.odo.odo_backend.service;

import com.odo.odo_backend.model.RegistroAuditoria;
import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.RegistroAuditoriaRepositorio;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistroAuditoriaServicio {

    private final RegistroAuditoriaRepositorio registroRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public void registrar(RegistroAuditoria.Accion accion,
                          String tipoEntidad, String idEntidad,
                          String descripcion,
                          String ip, String agenteUsuario) {

        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "anonimo";

        Long usuarioId = null;
        String usuarioNombre = email;
        Usuario.Rol usuarioRol = null;

        var usuarioOpt = usuarioRepositorio.findByEmail(email);
        if (usuarioOpt.isPresent()) {
            var u = usuarioOpt.get();
            usuarioId     = u.getId();
            usuarioNombre = u.getNombre();
            usuarioRol    = u.getRol();
        }

        registroRepositorio.save(RegistroAuditoria.builder()
                .usuarioId(usuarioId)
                .usuarioNombre(usuarioNombre)
                .usuarioRol(usuarioRol)
                .accion(accion)
                .tipoEntidad(tipoEntidad)
                .idEntidad(idEntidad)
                .descripcion(descripcion)
                .direccionIp(ip)
                .agenteUsuario(agenteUsuario)
                .build());
    }

    public Page<RegistroAuditoria> buscarFiltrado(Long usuarioId, RegistroAuditoria.Accion accion, Pageable pageable) {
        return registroRepositorio.findFiltrado(usuarioId, accion, pageable);
    }
}
