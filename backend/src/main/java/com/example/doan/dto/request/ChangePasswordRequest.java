package com.example.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword;
    @NotBlank
    @Size(min=10)
    private String newPassword;
    @NotBlank
    private String confirmPassword;
}
