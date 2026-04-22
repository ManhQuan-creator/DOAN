package com.example.doan.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String firstname;
    private String lastname;
    private String phone;
    private String address;
    private String country;
    private String countryCode;
    private String zipcode;
    private String city;
    private String cccd;
    private String birthday;
}
