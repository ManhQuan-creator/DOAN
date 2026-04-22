package com.example.doan.controller;


import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.ChatMessageResponse;
import com.example.doan.dto.reponse.ChatResponse;
import com.example.doan.dto.request.CreateChatRequest;
import com.example.doan.dto.request.SendMessageRequest;
import com.example.doan.service.ChatService;
import com.example.doan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/support") @RequiredArgsConstructor
public class ChatController {
    private final ChatService svc;
    private final UserService uSvc;

    @PostMapping("/chats")
    public ResponseEntity<ApiResponse<ChatResponse>> create(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody CreateChatRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Created", svc.create(uSvc.findByEmail(ud.getUsername()).getId(), r)));
    }
    @GetMapping("/chats")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> list(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(svc.userChats(uSvc.findByEmail(ud.getUsername()).getId())));
    }
    @GetMapping("/chats/{id}")
    public ResponseEntity<ApiResponse<ChatResponse>> get(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(svc.getChat(id, uSvc.findByEmail(ud.getUsername()).getId())));
    }
    @PostMapping("/chats/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> send(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud, @Valid @RequestBody SendMessageRequest r) {
        var u = uSvc.findByEmail(ud.getUsername());

        return ResponseEntity.ok(ApiResponse.ok(svc.send(id, u.getId(), r.getMessage(), u.getRole().name().equals("ADMIN"))));
    }
}