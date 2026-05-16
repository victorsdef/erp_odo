package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.UserRequest;
import com.odo.odo_backend.dto.response.UserResponse;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.User;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public UserResponse getById(Long id) {
        return UserResponse.from(findById(id));
    }

    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es requerida al crear un usuario");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse update(Long id, UserRequest request) {
        User user = findById(id);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso por otro usuario");
        }
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse toggleActive(Long id) {
        User user = findById(id);
        user.setActive(!user.isActive());
        return UserResponse.from(userRepository.save(user));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
