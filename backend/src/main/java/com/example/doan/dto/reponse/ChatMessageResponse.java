package com.example.doan.dto.reponse;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private String senderType;
    private String message;
    private String createdAt;
}