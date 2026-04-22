package com.example.doan.controller;

import com.example.doan.dto.reponse.ApiResponse;
import com.example.doan.dto.reponse.BookingResponse;
import com.example.doan.entity.Booking;
import com.example.doan.enums.PaymentMethod;
import com.example.doan.exception.BadRequestException;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.BookingRepository;
import com.example.doan.repository.UserRepository;
import com.example.doan.service.EmailService;
import com.example.doan.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@Slf4j
public class VnPayController {

    private final VnPayService vnPayService;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // Tạo URL thanh toán VNPay
    @PostMapping("/create-payment")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud,
            HttpServletRequest request) {

        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        String phone = body.get("phone") != null ? body.get("phone").toString() : null;

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));

        // Kiểm tra số điện thoại - bắt buộc phải có
        var user = booking.getUser();
        if (user != null && (user.getPhone() == null || user.getPhone().isEmpty())) {
            if (phone == null || phone.isEmpty()) {
                throw new BadRequestException("Vui lòng cập nhật số điện thoại trước khi thanh toán");
            }
            // Cập nhật số điện thoại
            user.setPhone(phone);
            userRepo.save(user);
        }

        String ipAddr = getIpAddress(request);
        String orderInfo = "Thanh+toan+ve+xe+" + booking.getBookingCode();
        String paymentUrl = vnPayService.createPaymentUrl(bookingId, booking.getTotalPrice(), orderInfo, ipAddr);

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(ApiResponse.ok("Tạo URL thanh toán thành công", result));
    }

    // VNPay callback sau khi thanh toán
    @GetMapping("/callback")
    public void vnpayCallback(
            @RequestParam Map<String, String> params,
            jakarta.servlet.http.HttpServletResponse response) throws Exception {

        log.info("VNPay callback received: {}", params);

        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
//        String bookingIdStr = vnp_TxnRef != null ? vnp_TxnRef.split("_")[0] : null;
        String bookingIdStr = vnp_TxnRef != null && vnp_TxnRef.length() > 13
                ? vnp_TxnRef.substring(0, vnp_TxnRef.length() - 13)
                : vnp_TxnRef;

        boolean isValid = vnPayService.verifyPayment(params);

        if (isValid && "00".equals(vnp_ResponseCode) && bookingIdStr != null) {
            try {
                Long bookingId = Long.parseLong(bookingIdStr);
                Booking booking = bookingRepo.findById(bookingId).orElse(null);
                if (booking != null && booking.getPaymentStatus() == 0) {
                    booking.setPaymentStatus(1);
                    booking.setPaymentMethod(PaymentMethod.VNPAY);
                    bookingRepo.save(booking);
                    log.info("VNPay payment success for booking: {}", bookingId);
                    // Gửi email xác nhận thanh toán
                    try {
                        emailService.sendPaymentSuccess(booking);
                    } catch (Exception e) {
                        log.error("Failed to send payment email", e);
                    }
                    response.sendRedirect(frontendUrl + "/user/payment/" + bookingId + "?vnpay=success");
                    return;
                }
            } catch (Exception e) {
                log.error("Error processing VNPay callback", e);
            }
        }

        String bookingId = bookingIdStr != null ? bookingIdStr : "0";
        response.sendRedirect(frontendUrl + "/user/payment/" + bookingId + "?vnpay=failed");
    }

    // API kiểm tra user có số điện thoại chưa
    @GetMapping("/check-phone")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkPhone(
            @AuthenticationPrincipal UserDetails ud) {
        var user = userRepo.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Map<String, Object> result = new HashMap<>();
        result.put("hasPhone", user.getPhone() != null && !user.getPhone().isEmpty());
        result.put("phone", user.getPhone());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }
}