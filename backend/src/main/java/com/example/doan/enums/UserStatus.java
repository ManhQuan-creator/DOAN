package com.example.doan.enums;

import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE(1, "Active"), LOCKED(0, "Locked");
    private final int value;
    private final String displayName;
    UserStatus(int v, String d) { this.value = v; this.displayName = d; }
    public static UserStatus fromValue(int v) {
        for (UserStatus s : values())
            if (s.value == v) return s;
        throw new IllegalArgumentException("Unknown UserStatus: " + v);
    }
}
