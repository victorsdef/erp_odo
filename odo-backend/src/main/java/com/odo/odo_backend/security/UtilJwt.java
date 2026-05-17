package com.odo.odo_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class UtilJwt {

    private final SecretKey clave;
    private final long expiracion;

    public UtilJwt(
            @Value("${jwt.secret}") String secreto,
            @Value("${jwt.expiration}") long expiracion) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes());
        this.expiracion = expiracion;
    }

    public String generateToken(String email, String rol) {
        return Jwts.builder()
                .subject(email)
                .claim("role", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiracion))
                .signWith(clave)
                .compact();
    }

    public String extractEmail(String token) {
        return parsearClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parsearClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parsearClaims(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }
}
