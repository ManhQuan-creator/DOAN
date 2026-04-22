package com.example.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChatRequest {
    @NotBlank
    private String description;
    @NotNull
    private Integer priority;
    @NotBlank private String message;
}
