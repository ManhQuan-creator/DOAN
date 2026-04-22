package com.example.doan.service;


import com.example.doan.dto.reponse.AuthResponse;
import com.example.doan.dto.reponse.GoogleLoginResponse;
import com.example.doan.dto.reponse.UserResponse;
import com.example.doan.dto.request.GoogleLoginRequest;
import com.example.doan.dto.request.LoginRequest;
import com.example.doan.dto.request.RegisterOtpRequest;
import com.example.doan.dto.request.RegisterRequest;
import com.example.doan.entity.RefreshToken;
import com.example.doan.entity.User;
import com.example.doan.enums.UserRole;
import com.example.doan.enums.UserStatus;
import com.example.doan.exception.BadRequestException;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.OtpTokenRepository;
import com.example.doan.repository.RefreshTokenRepository;
import com.example.doan.repository.UserRepository;
import com.example.doan.security.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j

public class AuthService {
    private final UserRepository userRepo;
    private final RefreshTokenRepository rtRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final EmailService emailService;
    private final AuthenticationManager authManager;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final OtpService otpService;
    private final OtpTokenRepository otpRepo;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Transactional
    public void sendRegisterOtp(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }
        // Gửi OTP về email người dùng muốn đăng ký
        otpService.sendOtp(req.getEmail(), req.getFirstname(), "REGISTER");
        log.info("Register OTP sent to: {}", req.getEmail());
    }

    @Transactional
    public void  registerWithOtp(RegisterOtpRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        // Xác minh OTP
        otpService.verifyOtp(req.getEmail(), req.getOtp(), "REGISTER");

        // Tạo tài khoản
        User u = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .firstname(req.getFirstname())
                .lastname(req.getLastname())
                .name(req.getFirstname() + " " + req.getLastname())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE.getValue())
                .type(1).build();
        userRepo.save(u);
        log.info("User registered with OTP: {}", req.getEmail());
    }
//admin otp
    public void adminLoginSendOtp(LoginRequest req) {
        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng"));

        if (!u.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Tài khoản không có quyền quản trị");
        }
        if (u.isLocked()) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        // Xác thực mật khẩu trước
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng");
        }

        // Gửi OTP về email admin
        otpService.sendOtp(u.getEmail(), u.getName(), "ADMIN_LOGIN");
        log.info("Admin login OTP sent to: {}", u.getEmail());
    }
    @Transactional
    public AuthResponse adminLoginVerifyOtp(String email, String otp) {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));

        if (!u.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Tài khoản không có quyền quản trị");
        }

        // Xác minh OTP
        otpService.verifyOtp(email, otp, "ADMIN_LOGIN");
        log.info("Admin logged in with OTP: {}", email);
        return buildAuth(u);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new BadRequestException("Email đã tồn tại");

        User u = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .firstname(req.getFirstname())
                .lastname(req.getLastname())
                .name(req.getFirstname() + " " + req.getLastname())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE.getValue())
                .type(1).build();
        userRepo.save(u);
        return buildAuth(u);
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không hợp lệ"));
        if (u.getRole().name().equals("ADMIN"))
            throw new BadRequestException("Quản trị viên phải đăng nhập tại \"/admin-login\".");
        if (u.isLocked())
            throw new BadRequestException("Tài khoản đã bị khóa");
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            return buildAuth(u);
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Email hoặc mật khẩu không hợp lệ");
        }
    }

    public AuthResponse adminLogin(LoginRequest req) {
        User u =userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng"));

        if (!u.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Tài khoản không có quyền quản trị");
        }

        if (u.isLocked()) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            return buildAuth(u);
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng");
        }
    }

    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken rt = rtRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (rt.isExpired()) {
            rtRepo.delete(rt);
            throw new BadRequestException("Token expired"); }
        return AuthResponse.builder()
                .accessToken(jwt.generateAccessToken(rt.getUser().getEmail()))
                .refreshToken(token)
                .tokenType("Bearer")
                .user(toUserRes(rt.getUser()))
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        // Tạo mật khẩu mới ngẫu nhiên
        String newPassword = generateRandomPassword(12);
        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);

        // Gửi email chứa mật khẩu mới
        emailService.sendPasswordReset(user.getEmail(), user.getName(), newPassword);
        log.info("Password reset for: {}", email);
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder();
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Transactional
    public void logout(Long uid) {

        rtRepo.deleteByUserId(uid);
    }

    private AuthResponse buildAuth(User u) {
        String role = "ROLE_" + u.getRole().name();
        String at = jwt.generateAccessToken(u.getEmail(),role);
        String rt = jwt.generateRefreshToken(u.getEmail());
        rtRepo.deleteByUserId(u.getId());
        rtRepo.save(RefreshToken
                .builder().
                user(u)
                .token(rt)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build());
        return AuthResponse
                .builder()
                .accessToken(at)
                .refreshToken(rt)
                .tokenType("Bearer")
                .user(toUserRes(u))
                .build();
    }

    public UserResponse toUserRes(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstname(u.getFirstname())
                .lastname(u.getLastname())
                .name(u.getName())
                .phone(u.getPhone())
                .address(u.getAddress())
                .cccd(u.getCccd())
                .imageUrl(u.getImageUrl())
                .role(u.getRole()
                        .name())
                .status(u.getStatus())
                .statusName(u.getUserStatus().getDisplayName())
                .type(u.getType())
                .country(u.getCountry())
                .countryCode(u.getCountryCode())
                .zipcode(u.getZipcode())
                .city(u.getCity())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : null)
                .build();
    }
    @Transactional
    public GoogleLoginResponse googleLogin(GoogleLoginRequest req) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(req.getToken());
            if (idToken == null) {
                throw new BadRequestException("Google Token Không Hợp Lệ");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            String pictureUrl = (String) payload.get("picture");

            if (firstName == null) firstName = "";
            if (lastName == null) lastName = "";

            // Tìm user existing hoặc tạo mới
            User user = userRepo.findByEmail(email).orElse(null);

            if (user == null) {
                // Tạo user mới từ Google account
                user = User.builder()
                        .email(email)
                        .password(null) // Google user không có password
                        .firstname(firstName)
                        .lastname(lastName)
                        .name(firstName + " " + lastName)
                        .imageUrl(pictureUrl)
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE.getValue())
                        .type(2) // type=2 cho Google user
                        .build();
                userRepo.save(user);
            } else {
                // User đã tồn tại
                if (user.getRole().name().equals("ADMIN")) {
                    throw new BadRequestException("Admin không thể đăng nhập bằng Google");
                }
                if (user.isLocked()) {
                    throw new BadRequestException("Tài khoản đã bị khóa");
                }
                // Cập nhật ảnh nếu chưa có
                if (user.getImageUrl() == null && pictureUrl != null) {
                    user.setImageUrl(pictureUrl);
                    userRepo.save(user);
                }
            }
            //gui otp yc verify
            otpService.sendOtp(user.getEmail(), user.getName(), "GOOGLE_LOGIN");
            return GoogleLoginResponse.builder()
                    .status("OTP_REQUIRED")
                    .email(user.getEmail())
                    .message("Mã OTP đã được gửi đến email của bạn")
                    .build();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Đăng nhập Google không thành công", e);
            throw new BadRequestException("Đăng nhập Google thất bại: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse verifyGoogleOtp(String email, String otp) {
        // Verify OTP
        otpService.verifyOtp(email, otp, "GOOGLE_LOGIN");

        // Tìm user
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));
        // Trả JWT
        return buildAuth(user);
    }

    public User findUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));
    }
}