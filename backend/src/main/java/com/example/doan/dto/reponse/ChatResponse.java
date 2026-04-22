package com.example.doan.dto.reponse;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private String description;
    private String lastMessage;
    private Integer status;
    private String statusName;
    private Integer priority;
    private String priorityName;
    private String userName;
    private String createdAt;
    private String updatedAt;
    private List<ChatMessageResponse> messages;
}