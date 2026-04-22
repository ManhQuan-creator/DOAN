package com.example.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateTicketRequest {
    @NotBlank
    private String departure;
    @NotBlank private String destination;
    private String seatLayout;
    private String type;
    @NotBlank private String startTime;
    @NotBlank private String endTime;
    private String travelTime;
    private String offDay;
    private List<String> facilities;
    @NotNull
    private Integer seatsCount;
}
