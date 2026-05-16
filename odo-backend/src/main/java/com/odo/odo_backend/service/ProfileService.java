package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.ProfileRequest;
import com.odo.odo_backend.dto.response.UserResponse;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.User;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile() {
        return UserResponse.from(currentUser());
    }

    public UserResponse updateProfile(ProfileRequest request) {
        User user = currentUser();

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso por otro usuario");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("Debes ingresar tu contraseña actual para cambiarla");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("La contraseña actual es incorrecta");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
