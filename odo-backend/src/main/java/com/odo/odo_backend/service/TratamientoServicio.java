package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.TratamientoRequest;
import com.odo.odo_backend.dto.response.TratamientoRespuesta;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Tratamiento;
import com.odo.odo_backend.repository.TratamientoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TratamientoServicio {

    private final TratamientoRepositorio tratamientoRepositorio;

    public List<TratamientoRespuesta> obtenerTodos() {
        return tratamientoRepositorio.findAll().stream().map(TratamientoRespuesta::from).toList();
    }

    public List<TratamientoRespuesta> obtenerActivos() {
        return tratamientoRepositorio.findByActivoTrue().stream().map(TratamientoRespuesta::from).toList();
    }

    public TratamientoRespuesta crear(TratamientoRequest req) {
        Tratamiento t = Tratamiento.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .precioBase(req.getPrecioBase())
                .duracionMinutos(req.getDuracionMinutos())
                .build();
        return TratamientoRespuesta.from(tratamientoRepositorio.save(t));
    }

    public TratamientoRespuesta actualizar(Long id, TratamientoRequest req) {
        Tratamiento t = buscar(id);
        t.setNombre(req.getNombre());
        t.setDescripcion(req.getDescripcion());
        t.setPrecioBase(req.getPrecioBase());
        t.setDuracionMinutos(req.getDuracionMinutos());
        return TratamientoRespuesta.from(tratamientoRepositorio.save(t));
    }

    public TratamientoRespuesta alternarActivo(Long id) {
        Tratamiento t = buscar(id);
        t.setActivo(!t.isActivo());
        return TratamientoRespuesta.from(tratamientoRepositorio.save(t));
    }

    public void eliminar(Long id) {
        tratamientoRepositorio.delete(buscar(id));
    }

    private Tratamiento buscar(Long id) {
        return tratamientoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Tratamiento no encontrado"));
    }
}
