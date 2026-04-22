package com.example.doan.dto.reponse;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalTickets;
    private long totalBookings;
    private long confirmedBookings;
    private long rejectedBookings;
    private long pendingBookings;
    private long totalRevenue;
    private double successRate;
    private long totalUsers;
    private long activeUsers;
    private long lockedUsers;
    private long verifiedUsers;
}