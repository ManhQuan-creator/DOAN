package com.example.doan.service;


import com.example.doan.dto.reponse.UserResponse;
import com.example.doan.dto.request.ChangePasswordRequest;
import com.example.doan.dto.request.UpdateProfileRequest;
import com.example.doan.entity.User;
import com.example.doan.exception.BadRequestException;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.Base64;

@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuthService authSvc;

    public UserResponse getProfile(Long id) {
        User user = findById(id);
        return authSvc
                .toUserRes(user); }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest r) {
        User u = findById(id);
        if (r.getName() != null) u.setName(r.getName());
        if (r.getFirstname() != null) u.setFirstname(r.getFirstname());
        if (r.getLastname() != null) u.setLastname(r.getLastname());
        if (r.getPhone() != null) u.setPhone(r.getPhone());
        if (r.getAddress() != null) u.setAddress(r.getAddress());
        if (r.getCountry() != null) u.setCountry(r.getCountry());
        if (r.getCountryCode() != null) u.setCountryCode(r.getCountryCode());
        if (r.getZipcode() != null) u.setZipcode(r.getZipcode());
        if (r.getCity() != null) u.setCity(r.getCity());
        if (r.getCccd() != null) u.setCccd(r.getCccd());
        if (r.getBirthday() != null) u.setBirthday(LocalDate.parse(r.getBirthday()));
        repo.save(u);
        return authSvc.toUserRes(u);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest r) {
        User u = findById(id);
        if (!r.getNewPassword().equals(r.getConfirmPassword()))
            throw new BadRequestException("Passwords do not match");
        if (u.getPassword() != null && r.getCurrentPassword() != null)
            if (!encoder.matches(r.getCurrentPassword(), u.getPassword()))
                throw new BadRequestException("Current password incorrect");
        u.setPassword(encoder.encode(r.getNewPassword()));
        repo.save(u);
    }

    @Transactional
    public UserResponse uploadAvatar(Long id, MultipartFile file) {
        User u = findById(id);
        try {
            // Dùng đường dẫn tuyệt đối
            String uploadDir = System.getProperty("user.dir") + "/uploads/avatars";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Chỉ cho phép các tệp hình ảnh.");
            }

            // Validate file size
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new BadRequestException("Kích thước tệp phải nhỏ hơn 5MB.");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = "avatar_" + id + "_" + System.currentTimeMillis() + extension;

            // Xóa avatar cũ
            if (u.getImageUrl() != null && u.getImageUrl().startsWith("/uploads/")) {
                try {
                    String oldFilePath = System.getProperty("user.dir") + u.getImageUrl();
                    java.nio.file.Path oldFile = java.nio.file.Paths.get(oldFilePath);
                    java.nio.file.Files.deleteIfExists(oldFile);
                } catch (Exception ignored) {}
            }

            // Lưu file mới
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.write(filePath, file.getBytes());

            u.setImageUrl("/uploads/avatars/" + fileName);
            repo.save(u);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Tải lên thất bại: " + e.getMessage());
        }
        return authSvc.toUserRes(u);
    }
    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng" +id)); }
    public User findByEmail(String e) {
        return repo.findByEmail(e)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng" +e)); }
}