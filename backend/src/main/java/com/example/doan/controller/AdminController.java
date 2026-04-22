package com.example.doan.controller;


import com.example.doan.dto.reponse.*;
import com.example.doan.dto.request.CreateTicketRequest;
import com.example.doan.dto.request.SendMessageRequest;
import com.example.doan.dto.request.UpdateTicketRequest;
import com.example.doan.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminSvc;
    private final BookingService bookingSvc;
    private final ChatService chatSvc;
    private final TicketService ticketSvc;
    private final UserService userSvc;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(adminSvc.stats()));
    }

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody CreateTicketRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Created", ticketSvc.create(r)));
    }
    @PutMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(@PathVariable Long id, @RequestBody UpdateTicketRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", ticketSvc.update(id, r)));
    }
    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketSvc.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> allBookings() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.all()));
    }
    @GetMapping("/bookings/pending")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.byStatus(3)));
    }
    @GetMapping("/bookings/confirmed")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> confirmed() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.byStatus(1)));
    }
    @GetMapping("/bookings/rejected")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> rejected() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.byStatus(2)));
    }
    @PutMapping("/bookings/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Confirmed", bookingSvc.confirm(id)));
    }
    @PutMapping("/bookings/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Rejected", bookingSvc.reject(id)));
    }
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingSvc.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
    @GetMapping("/bookings/unpaid")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> unpaid() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.byPaymentStatus(0)));
    }

    // Lấy bookings đã thanh toán
    @GetMapping("/bookings/paid")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> paid() {
        return ResponseEntity.ok(ApiResponse.ok(bookingSvc.byPaymentStatus(1)));
    }
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.ok(adminSvc.allUsers()));
    }
    @GetMapping("/users/active")
    public ResponseEntity<ApiResponse<List<UserResponse>>> active() {
        return ResponseEntity.ok(ApiResponse.ok(adminSvc.usersByStatus(1)));
    }
    @GetMapping("/users/locked")
    public ResponseEntity<ApiResponse<List<UserResponse>>> locked() {
        return ResponseEntity.ok(ApiResponse.ok(adminSvc.usersByStatus(0)));
    }
    @PutMapping("/users/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lock(@PathVariable Long id) {
        adminSvc.lock(id);
        return ResponseEntity.ok(ApiResponse.ok("Locked", null));
    }
    @PutMapping("/users/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlock(@PathVariable Long id) {
        adminSvc.unlock(id);
        return ResponseEntity.ok(ApiResponse.ok("Unlocked", null));
    }

    @GetMapping("/support/chats")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> chats() {
        return ResponseEntity.ok(ApiResponse.ok(chatSvc.allChats()));
    }
    @PostMapping("/support/chats/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> reply(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud, @Valid @RequestBody SendMessageRequest r) {
        return ResponseEntity.ok(ApiResponse.ok(chatSvc.send(id, userSvc.findByEmail(ud.getUsername()).getId(), r.getMessage(), true)));
    }
    @GetMapping("/support/chats/{id}")
    public ResponseEntity<ApiResponse<ChatResponse>> getChat(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(chatSvc.getChatForAdmin(id)));
    }
}
