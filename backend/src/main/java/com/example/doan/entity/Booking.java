package com.example.doan.entity;

import com.example.doan.enums.BookingStatus;
import com.example.doan.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false) private String dateStart;
    @Column(nullable = false) private Long totalPrice;
    @Column(nullable = false)
    @Builder.Default
    private Integer status = 3;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    @Builder.Default
    private Integer paymentStatus = 0;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingSeat> bookingSeats = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = 3;
        if (paymentStatus == null) paymentStatus = 0;
    }
    @PreUpdate
    protected void onUpdate()
    { updatedAt = LocalDateTime.now(); }

    @Transient
    public BookingStatus getBookingStatus() {
        return BookingStatus.fromValue(status); }
    @Transient
    public String getStatusDisplayName() {
        return BookingStatus.fromValue(status).getDisplayName(); }
}
