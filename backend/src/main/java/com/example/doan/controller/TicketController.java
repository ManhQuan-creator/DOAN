package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.SeatResponse;
import com.example.doan.dto.reponse.TicketResponse;
import com.example.doan.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
private final TicketService svc;

@GetMapping
public ResponseEntity<ApiResponse<List<TicketResponse>>> list(
        @RequestParam(required=false) String departure,
        @RequestParam(required=false) String destination,
        @RequestParam(required=false) String type,
        @RequestParam(required = false) String date) {
    return ResponseEntity.ok(ApiResponse.ok(svc.getAll(departure,destination,type,date)));
}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.getById(id)));
    }
    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> seats(@PathVariable Long id,
                                                                 @RequestParam String date) {
        return ResponseEntity.ok(ApiResponse.ok(svc.getSeats(id, date)));
    }
}
