package com.example.doan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="otp_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private String type; // "CHANGE_PASSWORD" hoặc "GOOGLE_LOGIN"

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used;

    @PrePersist
    protected void onCreate() {
        if (expiryDate == null)
            expiryDate = LocalDateTime.now().plusMinutes(5);
    }

    public boolean isExpired() {

        return LocalDateTime.now().isAfter(expiryDate);
    }
}
