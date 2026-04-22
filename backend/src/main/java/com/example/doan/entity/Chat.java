package com.example.doan.entity;

import com.example.doan.enums.Priority;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String description;
    @Column(columnDefinition = "TEXT")
    private String lastMessage;
    @Builder.Default
    private Integer status = 2;
    @Builder.Default
    private Integer priority = Priority.LOW.getValue();

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ChatMessage>
            messages = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() {
        updatedAt = LocalDateTime.now(); }

    @Transient public Priority getChatPriority() {
        return Priority.fromValue(priority); }
}