package com.example.doan.dto.reponse;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private Long id;
    private String name;
    private Long price;
    private Integer seatOrder;
    private boolean booked;
}