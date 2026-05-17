package com.odo.odo_backend.controller;

import com.odo.odo_backend.model.RegistroAuditoria;
import com.odo.odo_backend.service.RegistroAuditoriaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class RegistroAuditoriaControlador {

    private final RegistroAuditoriaServicio registroServicio;

    @GetMapping
    public ResponseEntity<Page<RegistroAuditoria>> obtenerRegistros(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) RegistroAuditoria.Accion accion,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamano) {

        PageRequest pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "creadoEn"));
        return ResponseEntity.ok(registroServicio.buscarFiltrado(usuarioId, accion, pageable));
    }
}
