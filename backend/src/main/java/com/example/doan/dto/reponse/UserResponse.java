package com.example.doan.dto.reponse;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private String name;
    private String phone;
    private String address;
    private String cccd;
    private String imageUrl;
    private String role;
    private Integer status;
    private String statusName;
    private Integer type;
    private String country;
    private String countryCode;
    private String zipcode;
    private String city;
    private String createdAt;
}