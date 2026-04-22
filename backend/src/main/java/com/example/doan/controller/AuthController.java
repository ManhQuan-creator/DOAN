package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.AuthResponse;
import com.example.doan.dto.reponse.GoogleLoginResponse;
import com.example.doan.dto.request.*;
import com.example.doan.entity.User;
import com.example.doan.service.AuthService;
import com.example.doan.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService svc;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký", svc.register(r)));
    }
    //gui otp
    @PostMapping("/register/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendRegisterOtp(
            @Valid @RequestBody RegisterRequest r) {
        svc.sendRegisterOtp(r);
        return ResponseEntity.ok(ApiResponse.ok(
                "OTP đã gửi đến " + r.getEmail() + ". Vui lòng kiểm tra hộp thư.", null));
    }
// xac nhan otp
    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse<Void>> registerVerifyOtp(
            @Valid @RequestBody RegisterOtpRequest r) {
        svc.registerWithOtp(r);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công",null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Đăng Nhập Thành Công", svc.login(r)));
    }
    //xac thuc admin
    @PostMapping("/admin/login/send-otp")
    public ResponseEntity<ApiResponse<Void>> adminLoginSendOtp(
            @Valid @RequestBody LoginRequest r) {
        svc.adminLoginSendOtp(r);
        return ResponseEntity.ok(ApiResponse.ok(
                "OTP đã gửi đến email admin. Vui lòng kiểm tra hộp thư.", null));
    }
    //xac thuc otp
    @PostMapping("/admin/login/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLoginVerifyOtp(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        return ResponseEntity.ok(ApiResponse.ok("Admin đăng nhập thành công",
                svc.adminLoginVerifyOtp(email, otp)));
    }
    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(
            @Valid @RequestBody LoginRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Admin Đăng Nhập Thành Công",
                svc.adminLogin(r)));
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody Map<String,String> r) {
        return ResponseEntity.ok(ApiResponse.ok(
                svc.refreshToken(r.get("refreshToken"))));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgot(
            @RequestBody Map<String,String> r) {
        svc.forgotPassword(r.get("email"));
        return ResponseEntity.ok(ApiResponse.ok("Email đặt lại đã được gửi", null));
    }
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<GoogleLoginResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest r) {
        GoogleLoginResponse response = svc.googleLogin(r);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpRequest r) {
        User user = svc.findUserByEmail(r.getEmail());
        otpService.sendOtp(r.getEmail(), user.getName(), r.getType());
        return ResponseEntity.ok(ApiResponse.ok("OTP đã được gửi", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest r) {
        otpService.verifyOtp(r.getEmail(), r.getOtp(), r.getType());
        return ResponseEntity.ok(ApiResponse.ok("OTP xác nhận thành công", null));
    }
    @PostMapping("/google/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyGoogleOtp(
            @RequestBody OtpVerifyRequest req) {
        AuthResponse auth = svc.verifyGoogleOtp(req.getEmail(), req.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", auth));
    }
}
