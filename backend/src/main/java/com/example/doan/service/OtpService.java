package com.example.doan.service;


import com.example.doan.entity.OtpToken;
import com.example.doan.exception.BadRequestException;
import com.example.doan.repository.OtpTokenRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpTokenRepository otpRepo;
    private final EmailService emailService;
    private final EntityManager entityManager;
    @Transactional
    public void sendOtp(String email, String userName, String type) {
        // Xóa OTP cũ
        otpRepo.deleteByEmailAndType(email, type);
        otpRepo.flush();

        // Tạo OTP mới (6 chữ số)
        String otp = generateOtp();

        OtpToken token = OtpToken.builder()
                .email(email)
                .otp(otp)
                .type(type)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        otpRepo.save(token);

        // Gửi email
        String purpose;
        switch (type) {
            case "CHANGE_PASSWORD":
                purpose = "Bạn đang yêu cầu đổi mật khẩu.";
                break;
            case "GOOGLE_LOGIN":
                purpose = "Bạn đang đăng nhập bằng Google.";
                break;
            case "REGISTER":
                purpose = "Xác nhận đăng ký tài khoản mới.";
                break;
            case "ADMIN_LOGIN":
                purpose = "Xác nhận đăng nhập quản trị viên.";
                break;
            default:
                purpose = "Xác nhận hành động của bạn.";
        }
        emailService.sendOtp(email, userName, otp, purpose);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp, String type) {
//ưu tiên mới nhất
//        List<OtpToken> tokens = otpRepo.findLatestOtp(email, type);

        OtpToken token = otpRepo.findByEmailAndOtpAndType(email, otp, type)
                .orElseThrow(() -> new BadRequestException("Mã OTP không hợp lệ"));

        if (token.isExpired()) {
            otpRepo.delete(token);
            throw new BadRequestException("Mã OTP đã hết hạn");
        }
        if (token.isUsed()) {
            throw new BadRequestException("Mã OTP đã được sử dụng");
        }
        token.setUsed(true);
        otpRepo.save(token);
        otpRepo.flush();
        otpRepo.deleteByEmailAndType(email, type);
        return true;
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
