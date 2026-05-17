package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Factura;
import com.odo.odo_backend.model.PagoCuota;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class FacturaRespuesta {
    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long dentistaId;
    private String dentistaNombre;
    private BigDecimal total;
    private BigDecimal pagado;
    private BigDecimal saldo;
    private String descripcion;
    private Factura.Estado estado;
    private int numeroCuotas;
    private BigDecimal montoCuota;
    private LocalDateTime creadoEn;
    private LocalDateTime pagadoEn;
    private List<DetallePago> pagos;

    @Data @Builder
    public static class DetallePago {
        private Long id;
        private BigDecimal monto;
        private String notas;
        private LocalDateTime pagadoEn;

        public static DetallePago from(PagoCuota p) {
            return DetallePago.builder()
                    .id(p.getId())
                    .monto(p.getMonto())
                    .notas(p.getNotas())
                    .pagadoEn(p.getPagadoEn())
                    .build();
        }
    }

    public static FacturaRespuesta from(Factura f, List<PagoCuota> pagos) {
        BigDecimal saldo = f.getTotal().subtract(f.getPagado());
        BigDecimal montoCuota = f.getNumeroCuotas() > 1
                ? f.getTotal().divide(BigDecimal.valueOf(f.getNumeroCuotas()), 2, java.math.RoundingMode.HALF_UP)
                : f.getTotal();
        String pacienteNombre = f.getPaciente() != null
                ? f.getPaciente().getNombre() + " " + f.getPaciente().getApellido() : null;
        String dentistaNombre = f.getDentista() != null ? f.getDentista().getNombre() : null;

        return FacturaRespuesta.builder()
                .id(f.getId())
                .pacienteId(f.getPaciente() != null ? f.getPaciente().getId() : null)
                .pacienteNombre(pacienteNombre)
                .dentistaId(f.getDentista() != null ? f.getDentista().getId() : null)
                .dentistaNombre(dentistaNombre)
                .total(f.getTotal())
                .pagado(f.getPagado())
                .saldo(saldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : saldo)
                .descripcion(f.getDescripcion())
                .estado(f.getEstado())
                .numeroCuotas(f.getNumeroCuotas())
                .montoCuota(montoCuota)
                .creadoEn(f.getCreadoEn())
                .pagadoEn(f.getPagadoEn())
                .pagos(pagos.stream().map(DetallePago::from).toList())
                .build();
    }
}
