package com.example.doan.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {
    @NotNull
    private Long ticketId;
    @NotBlank
    private String dateStart;
    @NotEmpty
    private List<Long> seatIds;
    private String paymentMethod;
}
