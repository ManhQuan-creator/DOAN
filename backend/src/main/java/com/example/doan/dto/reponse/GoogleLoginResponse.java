package com.example.doan.dto.reponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GoogleLoginResponse {
    private String status; //trang thai thanh cong hay fail
    private String email; // fe biet gui otp
    private String message;
    private AuthResponse authData; //co khi status thanh cong
}
