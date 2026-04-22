package com.example.doan.service;


import com.example.doan.dto.reponse.SeatResponse;
import com.example.doan.dto.reponse.TicketResponse;
import com.example.doan.dto.request.CreateTicketRequest;
import com.example.doan.dto.request.UpdateTicketRequest;
import com.example.doan.entity.Seat;
import com.example.doan.entity.Ticket;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.BookingRepository;
import com.example.doan.repository.SeatRepository;
import com.example.doan.repository.TicketRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {
    private final TicketRepository ticketRepo;
    private final SeatRepository seatRepo;
    private final BookingRepository bookingRepo;
    private final ObjectMapper mapper;

    public List<TicketResponse> getAll(String dep, String dest, String type,String date) {
        List<Ticket> tickets;

        if (date != null && !date.isEmpty()) {
            // Parse ngày và lấy tên thứ trong tuần (tiếng Anh)
            String dayOfWeek = getDayOfWeekEnglish(date);
            if (dayOfWeek != null) {
                tickets = ticketRepo.findFilteredByDate(dep, dest, type, dayOfWeek);
            } else {
                tickets = ticketRepo.findFiltered(dep, dest, type);
            }
        } else {
            tickets = ticketRepo.findFiltered(dep, dest, type);
        }
        return tickets.stream().map(this::toRes).collect(Collectors.toList());
    }
    public List<TicketResponse> getAll(String dep, String dest, String type) {
        return getAll(dep, dest, type, null);
    }

    public TicketResponse getById(Long id) {
        Ticket t = ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found" +id));
        TicketResponse r = toRes(t);
        r.setSeats(t.getSeats()
                .stream()
                .map(s -> SeatResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .price(s.getPrice())
                        .seatOrder(s.getSeatOrder())
                        .booked(false)
                        .build())
                .collect(Collectors.toList()));
        return r;
    }
     //  Chuyển dd/MM/yyyy sang tên thứ tiếng Anh

    private String getDayOfWeekEnglish(String dateStr) {
        try {
            // Hỗ trợ cả 2 format: dd/MM/yyyy và yyyy-MM-dd
            LocalDate date;
            if (dateStr.contains("/")) {
                date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else {
                date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
            // Trả về: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
            return date.getDayOfWeek().name().charAt(0) +
                    date.getDayOfWeek().name().substring(1).toLowerCase();
        } catch (DateTimeParseException e) {
            log.warn("Không parse được ngày: {}", dateStr);
            return null;
        }
    }

    public List<SeatResponse> getSeats(Long tid, String date) {
        List<Seat> seats = seatRepo.findByTicketIdOrderBySeatOrderAsc(tid);
        List<Long> booked = bookingRepo.findBookedSeatIds(tid, date);
        return seats.stream()
                .map(s -> SeatResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .price(s.getPrice())
                        .seatOrder(s.getSeatOrder())
                        .booked(booked.contains(s.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest req) {
        String fac = "[]";
        try {
            if (req.getFacilities() != null)
                fac = mapper.writeValueAsString(req.getFacilities()); }
        catch (Exception ignored) {}
        Ticket t = Ticket.builder()
                .departure(req.getDeparture())
                .destination(req.getDestination())
                .seatLayout(req.getSeatLayout() != null ? req.getSeatLayout() : "2x2")
                .type(req.getType() != null ? req.getType() : "AC")
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .travelTime(req.getTravelTime())
                .offDay(req.getOffDay())
                .facilities(fac)
                .isActive(1)
                .build();
        ticketRepo.save(t);
        if (req.getSeatsCount() != null && req.getSeatsCount() > 0) seedSeats(t, req.getSeatsCount());
        return toRes(t);
    }

    @Transactional
    public TicketResponse update(Long id, UpdateTicketRequest req) {
        Ticket t = ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));
        if (req.getDeparture() != null) t.setDeparture(req.getDeparture());
        if (req.getDestination() != null) t.setDestination(req.getDestination());
        if (req.getSeatLayout() != null) t.setSeatLayout(req.getSeatLayout());
        if (req.getType() != null) t.setType(req.getType());
        if (req.getStartTime() != null) t.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) t.setEndTime(req.getEndTime());
        if (req.getTravelTime() != null) t.setTravelTime(req.getTravelTime());
        if (req.getOffDay() != null) t.setOffDay(req.getOffDay());
        if (req.getFacilities() != null)
            try {
                t.setFacilities(mapper.writeValueAsString(req.getFacilities())); }
        catch (Exception ignored) {}
        ticketRepo.save(t);
        return toRes(t);
    }

    @Transactional
    public void delete(Long id) {
        Ticket t = ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));
        t.setIsActive(0);
        ticketRepo.save(t);
    }

    private void seedSeats(Ticket t, int count) {
        String[] rows = {"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"};
        for (int i = 0; i < count; i++) {
            String name = rows[i / 4] + ((i % 4) + 1);
            long price = Math.max(1000000 - (long)(i / 4) * 100000, 400000);
            seatRepo.save(Seat.builder()
                    .ticket(t)
                    .name(name)
                    .price(price)
                    .seatOrder(i + 1)
                    .build());
        }
    }

    private TicketResponse toRes(Ticket t) {
        List<String> fac = new ArrayList<>();
        try {
            if (t.getFacilities() != null)
                fac = mapper.readValue(t.getFacilities(),
                        new TypeReference<List<String>>() {}
                );
        }
        catch (Exception ignored) {}
        return TicketResponse
                .builder()
                .id(t.getId())
                .departure(t.getDeparture())
                .destination(t.getDestination())
                .seatLayout(t.getSeatLayout())
                .type(t.getType())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .travelTime(t.getTravelTime())
                .offDay(t.getOffDay())
                .facilities(fac)
                .totalSeats(t.getSeats() != null ? t.getSeats().size() : 0)
                .build();
    }
}