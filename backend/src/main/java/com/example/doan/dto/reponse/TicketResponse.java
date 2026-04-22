package com.example.doan.dto.reponse;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String departure;
    private String destination;
    private String seatLayout;
    private String type;
    private String startTime;
    private String endTime;
    private String travelTime;
    private String offDay;
    private List<String> facilities;
    private int totalSeats;
    private List<SeatResponse> seats;
}