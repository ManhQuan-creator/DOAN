package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.request.OtpRequest;
import com.example.doan.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    private final EmailService emailService;
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> contact(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String subject = body.get("subject");
        String message = body.get("message");

        if (name == null || email == null ||
                subject == null || message == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Vui lòng điền đầy đủ thông tin"));
        }

        emailService.sendContactEmail(
                "manhquan0415@gmail.com",
                name, email, subject, message
        );
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi", null));
    }
    }




