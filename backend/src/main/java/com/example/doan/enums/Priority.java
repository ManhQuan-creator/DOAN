package com.example.doan.enums;

import lombok.Getter;

//mức độ ưu tiên
@Getter
public enum Priority {
    HIGH(1, "Cao"), MEDIUM(2, "Trung Bình"), LOW(3, "Thấp");
    private final int value;
    private final String displayName;
    Priority(int v, String d) {
        this.value = v;
        this.displayName = d;
    }
    public static Priority fromValue(int v) {
        for (Priority p : values())
            if (p.value == v) return p;
        throw new IllegalArgumentException("Unknown Priority: " + v);
    }
}
