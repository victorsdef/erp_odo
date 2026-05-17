package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.LoginRequest;
import com.odo.odo_backend.dto.response.AutenticacionRespuesta;
import com.odo.odo_backend.service.AutenticacionServicio;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacionControlador {

    private final AutenticacionServicio autenticacionServicio;

    @PostMapping("/login")
    public ResponseEntity<AutenticacionRespuesta> iniciarSesion(@Valid @RequestBody LoginRequest request,
                                                                  HttpServletRequest httpRequest) {
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = httpRequest.getRemoteAddr();
        String agenteUsuario = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(autenticacionServicio.iniciarSesion(request, ip, agenteUsuario));
    }
}
