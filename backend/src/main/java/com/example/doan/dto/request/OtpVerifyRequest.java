package com.example.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String otp;
    @NotBlank
    private String type;
}