package com.example.doan.enums;

import lombok.Getter;

@Getter
public enum BookingStatus {
    CONFIRMED(1, "Xac Nhan"), REJECTED(2, "Tu Choi"), PENDING(3, "Dang Cho");
    private final int value;
    private final String displayName;
    BookingStatus(int v, String d) {
        this.value = v;
        this.displayName = d;
    }
    public static BookingStatus fromValue(int v) {
        for (BookingStatus s : values())
            if (s.value == v) return s;
        throw new IllegalArgumentException("Unknown BookingStatus: " + v);
    }
}
