package com.example.doan.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${app.jwt.secret}")
    private String secret;
    @Value("${app.jwt.access-token-expiration}")
    private long accessExp;
    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshExp;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        return build(userDetails.getUsername(),role, accessExp);
    }
    public String generateAccessToken(String email) {
        return build(email,null,accessExp);
    }
    public String generateAccessToken(String email, String role) {
        return build(email,role,accessExp);
    }
    public String generateRefreshToken(String email) {
        return build(email,null, refreshExp);
    }

    private String build(String sub,String role, long exp) {
        Date now = new Date();
        var builder = Jwts.builder()
                .subject(sub)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + exp));
        if (role != null) {
            builder.claim("role", role); // ghi role vào token
        }
        return builder.signWith(key()).compact();
    }

    public String getEmail(String token) {
        try {
            Object role = Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return role != null ? role.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
    public String getRole(String token) {
        try {
            Object role = Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role");
            return role != null ? role.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validate(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token);
            return true;
        }
        catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}