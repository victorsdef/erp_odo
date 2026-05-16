package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.LoginRequest;
import com.odo.odo_backend.dto.response.AuthResponse;
import com.odo.odo_backend.dto.response.UserResponse;
import com.odo.odo_backend.exception.UnauthorizedException;
import com.odo.odo_backend.model.AuditLog;
import com.odo.odo_backend.repository.UserRepository;
import com.odo.odo_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    public AuthResponse login(LoginRequest request, String ip, String userAgent) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Usuario inactivo");
        }

        // Set authentication in context so AuditLogService can read the user
        var auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        SecurityContextHolder.getContext().setAuthentication(auth);

        auditLogService.log(AuditLog.Action.LOGIN, "User", user.getId().toString(),
                "Inicio de sesión", ip, userAgent);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.from(user))
                .build();
    }
}
