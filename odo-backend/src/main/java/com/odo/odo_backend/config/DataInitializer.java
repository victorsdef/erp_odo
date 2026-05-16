package com.odo.odo_backend.config;

import com.odo.odo_backend.model.User;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner seedAdmin() {
        return args -> {
            if (userRepository.existsByEmail("admin@odo.com")) return;

            userRepository.save(User.builder()
                    .email("admin@odo.com")
                    .password(passwordEncoder.encode("Admin123!"))
                    .name("Administrador")
                    .role(User.Role.ADMIN)
                    .active(true)
                    .build());

            log.info("Usuario admin creado: admin@odo.com / Admin123!");
        };
    }
}
