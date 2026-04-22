package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.UserResponse;
import com.example.doan.dto.request.ChangePasswordRequest;
import com.example.doan.dto.request.UpdateProfileRequest;
import com.example.doan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
private final UserService svc;

@GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserDetails ud) {
    return ResponseEntity.ok(ApiResponse.ok(svc.getProfile(svc.findByEmail(ud.getUsername()).getId())));
}
@PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> update(@AuthenticationPrincipal UserDetails ud, @RequestBody UpdateProfileRequest r){
    return ResponseEntity.ok(ApiResponse.ok("Updated",svc.updateProfile(svc.findByEmail(ud.getUsername()).getId(),r)));
}
@PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> password(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody ChangePasswordRequest r) {
        svc.changePassword(svc.findByEmail(ud.getUsername()).getId(), r);
        return ResponseEntity.ok(ApiResponse.ok("Password changed", null));
    }
@PutMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> avatar(@AuthenticationPrincipal UserDetails ud, @RequestParam("file") MultipartFile f) {
        return ResponseEntity.ok(ApiResponse.ok("Avatar updated", svc.uploadAvatar(svc.findByEmail(ud.getUsername()).getId(), f)));
    }
}
