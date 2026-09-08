package com.trustmedai.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Generate JWT Token
    public String generateToken(String email, String role) {

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpiration
                        )
                )
                .signWith(
                        io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                secretKey.getBytes()
                        )
                )
                .compact();
    }
    // Extract Email
    public String extractEmail(String token) {

        Claims claims =
                Jwts.parser()
                        .verifyWith(
                                io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                        secretKey.getBytes()
                                )
                        )
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

        return claims.getSubject();
    }
    public String extractRole(String token) {

        Claims claims =
                Jwts.parser()
                        .verifyWith(
                                io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                        secretKey.getBytes()
                                )
                        )
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

        return claims.get("role", String.class);
    }
    // Validate Token
    public boolean validateToken(String token) {

        try {

            Jwts.parser()
                    .verifyWith(
                            io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                    secretKey.getBytes()
                            )
                    )
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}