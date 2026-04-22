package com.example.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String type;
}
