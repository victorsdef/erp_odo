package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.FacturaRequest;
import com.odo.odo_backend.dto.request.PagoRequest;
import com.odo.odo_backend.dto.response.FacturaRespuesta;
import com.odo.odo_backend.exception.RecursoNoEncontradoExcepcion;
import com.odo.odo_backend.model.Factura;
import com.odo.odo_backend.model.PagoCuota;
import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.PagoCuotaRepositorio;
import com.odo.odo_backend.repository.FacturaRepositorio;
import com.odo.odo_backend.repository.PacienteRepositorio;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaServicio {

    private final FacturaRepositorio facturaRepositorio;
    private final PagoCuotaRepositorio pagoRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    public List<FacturaRespuesta> obtenerTodas() {
        return facturaRepositorio.findAll().stream()
                .map(f -> FacturaRespuesta.from(f, pagoRepositorio.findByFacturaIdOrderByPagadoEnAsc(f.getId())))
                .toList();
    }

    public List<FacturaRespuesta> obtenerPorPaciente(Long pacienteId) {
        return facturaRepositorio.findByPacienteId(pacienteId).stream()
                .map(f -> FacturaRespuesta.from(f, pagoRepositorio.findByFacturaIdOrderByPagadoEnAsc(f.getId())))
                .toList();
    }

    public FacturaRespuesta obtenerPorId(Long id) {
        Factura f = buscar(id);
        return FacturaRespuesta.from(f, pagoRepositorio.findByFacturaIdOrderByPagadoEnAsc(id));
    }

    @Transactional
    public FacturaRespuesta crear(FacturaRequest req) {
        var paciente = pacienteRepositorio.findById(req.getPacienteId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Paciente no encontrado"));
        Usuario dentista = req.getDentistaId() != null
                ? usuarioRepositorio.findById(req.getDentistaId()).orElse(null) : null;

        Factura f = Factura.builder()
                .paciente(paciente)
                .dentista(dentista)
                .total(req.getTotal())
                .descripcion(req.getDescripcion())
                .numeroCuotas(Math.max(1, req.getNumeroCuotas()))
                .build();
        return FacturaRespuesta.from(facturaRepositorio.save(f), List.of());
    }

    @Transactional
    public FacturaRespuesta registrarPago(Long id, PagoRequest req) {
        Factura f = buscar(id);

        if (f.getEstado() == Factura.Estado.PAID || f.getEstado() == Factura.Estado.CANCELLED) {
            throw new IllegalArgumentException("Esta factura ya está " + f.getEstado().name().toLowerCase());
        }

        BigDecimal pendiente = f.getTotal().subtract(f.getPagado());
        if (req.getMonto().compareTo(pendiente) > 0) {
            throw new IllegalArgumentException("El monto excede el saldo pendiente (" + pendiente + ")");
        }

        PagoCuota pago = PagoCuota.builder()
                .factura(f)
                .monto(req.getMonto())
                .notas(req.getNotas())
                .build();
        pagoRepositorio.save(pago);

        BigDecimal nuevoPagado = f.getPagado().add(req.getMonto());
        f.setPagado(nuevoPagado);

        if (nuevoPagado.compareTo(f.getTotal()) >= 0) {
            f.setEstado(Factura.Estado.PAID);
            f.setPagadoEn(LocalDateTime.now());
        } else {
            f.setEstado(Factura.Estado.PARTIAL);
        }
        facturaRepositorio.save(f);

        return FacturaRespuesta.from(f, pagoRepositorio.findByFacturaIdOrderByPagadoEnAsc(id));
    }

    @Transactional
    public void cancelar(Long id) {
        Factura f = buscar(id);
        f.setEstado(Factura.Estado.CANCELLED);
        facturaRepositorio.save(f);
    }

    public void eliminar(Long id) {
        facturaRepositorio.delete(buscar(id));
    }

    private Factura buscar(Long id) {
        return facturaRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Factura no encontrada"));
    }
}
