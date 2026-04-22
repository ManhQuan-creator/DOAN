package com.example.doan.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateTicketRequest {
    private String departure;
    private String destination;
    private String seatLayout;
    private String type;
    private String startTime;
    private String endTime;
    private String travelTime;
    private String offDay;
    private List<String> facilities;
}
