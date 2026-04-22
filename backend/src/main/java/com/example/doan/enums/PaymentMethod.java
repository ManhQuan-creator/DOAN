package com.example.doan.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    ZALOPAY("ZaloPay"), ATM("ATM"), QR("QR"), VNPAY("VNPay");
    private final String displayName;
    PaymentMethod(String d) {
        this.displayName = d; }
    public String getDisplayName() {
        return displayName;
    }
}
