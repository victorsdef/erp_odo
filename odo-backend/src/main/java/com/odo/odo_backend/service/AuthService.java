package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.LoginRequest;
import com.odo.odo_backend.dto.response.AuthResponse;
import com.odo.odo_backend.dto.response.UserResponse;
import com.odo.odo_backend.exception.UnauthorizedException;
import com.odo.odo_backend.repository.UserRepository;
import com.odo.odo_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Usuario inactivo");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.from(user))
                .build();
    }
}
