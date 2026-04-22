package com.example.doan.dto.reponse;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeatResponse {
    private Long id;
    private Long seatId;
    private String seatName;
    private Long price;
}