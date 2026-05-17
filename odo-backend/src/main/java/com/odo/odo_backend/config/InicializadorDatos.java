package com.odo.odo_backend.config;

import com.odo.odo_backend.model.Usuario;
import com.odo.odo_backend.repository.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class InicializadorDatos {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner inicializarAdmin() {
        return args -> {
            if (usuarioRepositorio.existsByEmail("admin@odo.com")) return;

            usuarioRepositorio.save(Usuario.builder()
                    .email("admin@odo.com")
                    .contrasena(passwordEncoder.encode("Admin123!"))
                    .nombre("Administrador")
                    .rol(Usuario.Rol.ADMIN)
                    .activo(true)
                    .build());

            log.info("Usuario admin creado: admin@odo.com / Admin123!");
        };
    }
}
