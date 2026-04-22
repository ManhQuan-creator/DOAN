package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.BookingResponse;
import com.example.doan.dto.request.BookingRequest;

import com.example.doan.service.BookingService;
import com.example.doan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService svc;
    private final UserService uSvc;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody BookingRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Đã đặt", svc.createForUser(uSvc.findByEmail(ud.getUsername()).getId(), r)));
    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> my(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(svc.userBookings(uSvc.findByEmail(ud.getUsername()).getId())));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.byId(id)));
    }
    @GetMapping("/search/{code}")
    public ResponseEntity<ApiResponse<BookingResponse>> search(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(svc.byCode(code)));
    }
    @PutMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<BookingResponse>> updatePayment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String method = body.get("paymentMethod");
        return ResponseEntity.ok(ApiResponse.ok("Thanh toán đã được cập nhật",
                svc.updatePayment(id, method)));
    }
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails ud) {
        svc.cancelByUser(id, uSvc.findByEmail(ud.getUsername()).getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy vé", null));
    }
}