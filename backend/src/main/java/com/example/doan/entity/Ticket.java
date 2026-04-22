package com.example.doan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String departure;
    @Column(nullable = false) private String destination;
    @Builder.Default private String seatLayout = "2x2";
    @Builder.Default private String type = "AC";
    @Column(nullable = false) private String startTime;
    @Column(nullable = false) private String endTime;
    private String travelTime;
    private String offDay;
    @Column(columnDefinition = "JSON") private String facilities;
    @Builder.Default private Integer isActive = 1;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("seatOrder ASC")
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}