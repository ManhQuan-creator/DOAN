package com.example.doan.service;


import com.example.doan.dto.reponse.BookingResponse;
import com.example.doan.dto.reponse.BookingSeatResponse;
import com.example.doan.dto.request.BookingRequest;
import com.example.doan.entity.*;
import com.example.doan.enums.BookingStatus;
import com.example.doan.enums.PaymentMethod;
import com.example.doan.exception.BadRequestException;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    private final BookingRepository bookingRepo;
    private final BookingSeatRepository bsRepo;
    private final TicketRepository ticketRepo;
    private final SeatRepository seatRepo;
    private final UserRepository userRepo;
    private final EmailService emailSvc;
    private final ObjectMapper mapper;
    private final SimpMessagingTemplate ws;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Scheduled(fixedRate = 60000) //chạy mỗi 60s
    @Transactional
    public void unpaidBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);

        List<Booking> expiredBookings = bookingRepo
                .findPendingUnpaidBefore(cutoff);

        if (expiredBookings.isEmpty()) return;

        log.info("tìm thấy {} vé hết hạn thanh toán",
                expiredBookings.size());

        for (Booking b : expiredBookings) {
            b.setStatus(BookingStatus.REJECTED.getValue());
            bookingRepo.save(b);
            log.info("Auto-reject booking: {} (tạo lúc {})",
                    b.getBookingCode(), b.getCreatedAt());
            try {
                emailSvc.sendRejection(b);
            } catch (Exception e) {
                log.warn("Không gửi được email từ chối cho booking {}",
                        b.getBookingCode());
            }
        }
    }


    @Transactional
    public BookingResponse createForUser(Long uid, BookingRequest req) {
        User u = userRepo.findById(uid).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return process(req, u);
    }

    public List<BookingResponse> userBookings(Long uid) {
        return bookingRepo.findByUserIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updatePayment(Long id, String method) {
        Booking b = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy"));
        // Kiểm tra booking đã bị reject chưa (hết hạn 10 phút)
        if (b.getStatus() == BookingStatus.REJECTED.getValue()) {
            throw new BadRequestException(
                    "Booking đã bị từ chối do quá thời hạn thanh toán 2 phút. " +
                            "Vui lòng đặt vé mới.");
        }
        if (method != null) {
            try {
                b.setPaymentMethod(PaymentMethod.valueOf(method.toUpperCase()));
            } catch (Exception ignored) {}
        }
        b.setPaymentStatus(1);
        bookingRepo.save(b);
        return toRes(b);
    }

    public BookingResponse byId(Long id) {
        return toRes(bookingRepo.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Not found")));
    }

    public BookingResponse byCode(String c) {
        return toRes(bookingRepo.findByBookingCode(c).orElseThrow(()
                -> new ResourceNotFoundException("Not found")));
    }
    public List<BookingResponse> all() {
        return bookingRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toRes).collect(Collectors.toList());
    }
    public List<BookingResponse> byStatus(int s) {
        return bookingRepo.findByStatusOrderByCreatedAtDesc(s).stream().map(this::toRes).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse confirm(Long id) {
        Booking b = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy"));
        //ktra thanh toán
        if (b.getPaymentStatus() == null || b.getPaymentStatus() == 0) {
            throw new BadRequestException(
                    "Không thể xác nhận vé chưa thanh toán. " +
                            "Vui lòng chờ khách hàng hoàn tất thanh toán.");
        }

        //Kiểm tra booking đã bị reject chưa
        if (b.getStatus() == BookingStatus.REJECTED.getValue()) {
            throw new BadRequestException(
                    "Không thể xác nhận vé đã bị từ chối.");
        }
        b.setStatus(BookingStatus.CONFIRMED.getValue());
        bookingRepo.save(b);

        try {
            if (b.getTicket() != null) {
                // Eager load các field cần thiết
                String dep = b.getTicket().getDeparture();
                String dest = b.getTicket().getDestination();
                String startTime = b.getTicket().getStartTime();
            }
            if (b.getUser() != null) {
                b.getUser().getEmail(); // force load
            }
            emailSvc.sendConfirmation(b);
        } catch (Exception e) {
            log.error("Email failed", e);
        }
        return toRes(b);
    }

    @Transactional
    public BookingResponse reject(Long id) {
        Booking b = bookingRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        b.setStatus(BookingStatus.REJECTED.getValue()); bookingRepo.save(b);
        try {
            if (b.getTicket() != null) b.getTicket().getDeparture();
            if (b.getUser() != null) b.getUser().getEmail();
            emailSvc.sendRejection(b);
        } catch (Exception e) {
            log.error("Email failed", e);
        }
        return toRes(b);
    }

    @Transactional
    public void delete(Long id) {
        if (!bookingRepo.existsById(id)) throw new ResourceNotFoundException("Not found");
        bookingRepo.deleteById(id);
        ws.convertAndSend("/topic/booking-cancelled", id);
    }
    //Hủy vé
    @Transactional
    public void cancelByUser(Long bookingId, Long userId) {
        Booking b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vé"));

        // Chỉ cho phép hủy nếu booking thuộc về user này
        if (b.getUser() == null || !b.getUser().getId().equals(userId)) {
            throw new BadRequestException("Không có quyền hủy vé này");
        }

        // Chỉ hủy được khi đang ở trạng thái PENDING và chưa thanh toán
        if (b.getStatus() != BookingStatus.PENDING.getValue()) {
            throw new BadRequestException("Không thể hủy booking ở trạng thái này");
        }

        // Xóa luôn booking
        Long deletedId = b.getId();
        bookingRepo.deleteById(bookingId);

        ws.convertAndSend("/topic/booking-cancelled", deletedId);
        log.info("Booking {} cancelled by user {}", bookingId, userId);
    }

    private BookingResponse process(BookingRequest req, User u) {
        Ticket t = ticketRepo.findById(req.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        List<Long> booked = bookingRepo.findBookedSeatIds(req.getTicketId(), req.getDateStart());
        for (Long sid : req.getSeatIds())
            if (booked.contains(sid))
                throw new BadRequestException("Seat already booked");

        List<Seat> seats = seatRepo.findByIds(req.getSeatIds());
        if (seats.size() != req.getSeatIds().size())
            throw new BadRequestException("Invalid seat IDs");
        long total = seats.stream()
                    .mapToLong(Seat::getPrice)
                    .sum();

        PaymentMethod pm = null;
        if (req.getPaymentMethod() != null) try {
            pm = PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
        } catch (Exception ignored) {}

        Booking b = Booking.builder().bookingCode("BT" + System.currentTimeMillis())
                .user(u)
                .ticket(t)
                .dateStart(req.getDateStart())
                .totalPrice(total)
                .status(BookingStatus.PENDING.getValue())
                .paymentMethod(pm)
                .build();
        bookingRepo.save(b);

        List<BookingSeat> bs = seats.stream().map(s -> BookingSeat.builder()
                .booking(b)
                .seat(s)
                .seatName(s.getName())
                .price(s.getPrice()).build())
                .collect(Collectors.toList());
        bsRepo.saveAll(bs);
        b.setBookingSeats(bs);
        return toRes(b);
    }
    public List<BookingResponse> byPaymentStatus(int paymentStatus) {
        return bookingRepo.findByPaymentStatus(paymentStatus)
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    private BookingResponse toRes(Booking b) {
        Ticket t = b.getTicket();
        String pName="", pPhone="", pEmail="", pCccd=""; Integer pType=null;
        if (b.getUser() != null) {
            User u=b.getUser();
            pName=u.getName();
            pPhone=u.getPhone();
            pEmail=u.getEmail();
            pCccd=u.getCccd();
            pType=1;
        }
        List<String> fac = new ArrayList<>();
        try {
            if (t.getFacilities() != null)
                fac = mapper.readValue(t.getFacilities(),
                        new TypeReference<>() {});
        } catch (Exception ignored) {}

        List<BookingSeatResponse> sr = b.getBookingSeats() != null
                ? b.getBookingSeats().stream().map(bs ->
                        BookingSeatResponse.builder()
                        .id(bs.getId())
                        .seatId(bs.getSeat().getId())
                        .seatName(bs.getSeatName())
                        .price(bs.getPrice())
                        .build()
                )
                .collect(Collectors.toList())
                : new ArrayList<>();

        String paymentStatusName;
        if (b.getPaymentStatus() == null || b.getPaymentStatus() == 0) {
            paymentStatusName = "Chưa Thanh Toán";
        } else {
            paymentStatusName = "Đã Thanh Toán";
        }
        //thời gian còn lại để tt
        String paymentDeadlineInfo = null;
        if (b.getStatus() == BookingStatus.PENDING.getValue()
                && b.getPaymentStatus() == 0
                && b.getCreatedAt() != null) {
            long minutesElapsed = java.time.Duration
                    .between(b.getCreatedAt(), LocalDateTime.now())
                    .toMinutes();
            long minutesLeft = 2 - minutesElapsed;
            if (minutesLeft > 0) {
                paymentDeadlineInfo = "Còn " + minutesLeft + " phút để thanh toán";
            } else {
                paymentDeadlineInfo = "Hết hạn thanh toán";
            }
        }

        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .type(t.getType())
                .departure(t.getDeparture())
                .destination(t.getDestination())
                .dateStart(b.getDateStart())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .travelTime(t.getTravelTime())
                .seatLayout(t.getSeatLayout())
                .offDay(t.getOffDay())
                .ticketFacilities(fac)
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .statusName(b.getStatusDisplayName())
                .paymentMethod(b.getPaymentMethod() != null ? b.getPaymentMethod().getDisplayName() : null)
                .paymentStatus(b.getPaymentStatus())
                .paymentStatusName(paymentStatusName)
                .paymentDeadlineInfo(paymentDeadlineInfo)
                .seats(sr)
                .passengerName(pName)
                .passengerPhone(pPhone)
                .passengerEmail(pEmail)
                .passengerCccd(pCccd)
                .passengerType(pType)
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().format(FMT) : "")
                .build();
    }
}
