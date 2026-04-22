package com.example.doan.entity;

import com.example.doan.enums.UserRole;
import com.example.doan.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(unique = true,nullable = false)
    private String email;
    private String password;
    @Column(nullable = false)
    private String firstname;
    @Column(nullable = false)
    private String lastname;
    private String name;
    private String phone;
    private String address;
    private String cccd;
    private LocalDate birthday;
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private Integer status;

    @Column(nullable = false)
    private Integer type;

    private String country;
    private String countryCode;
    private String zipcode;
    private String city;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Chat> chats = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (name == null) name = firstname + " " + lastname;
        if (role == null) role = UserRole.USER;
        if (status == null) status = UserStatus.ACTIVE.getValue();
        if (type == null) type = 1;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    @Transient
    public UserStatus getUserStatus() {
        return UserStatus.fromValue(status);
    }
    public boolean isActive() {
        return status == UserStatus.ACTIVE.getValue();
    }
    public boolean isLocked() {
        return status == UserStatus.LOCKED.getValue();
    }
}
