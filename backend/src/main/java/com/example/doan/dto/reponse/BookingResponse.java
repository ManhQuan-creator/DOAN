package com.example.doan.dto.reponse;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private String type;
    private String departure;
    private String destination;
    private String dateStart;
    private String startTime;
    private String endTime;
    private String travelTime;
    private String seatLayout;
    private String offDay;
    private List<String> ticketFacilities;
    private Long totalPrice;
    private Integer status;
    private String statusName;
    private String paymentMethod;
    private Integer paymentStatus;
    private String paymentStatusName;
    private String paymentDeadlineInfo;
    private List<BookingSeatResponse> seats;
    private String passengerName;
    private String passengerPhone;
    private String passengerEmail;
    private String passengerCccd;
    private Integer passengerType;
    private String createdAt;

}