package com.example.doan.service;



import com.example.doan.dto.reponse.DashboardStatsResponse;
import com.example.doan.dto.reponse.UserResponse;
import com.example.doan.enums.UserStatus;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.BookingRepository;
import com.example.doan.repository.TicketRepository;
import com.example.doan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepo;
    private final TicketRepository ticketRepo;
    private final BookingRepository bookingRepo;
    private final AuthService authSvc;

    public DashboardStatsResponse stats() {
        long total = bookingRepo.count(), c = bookingRepo.countByStatus(1),
                r = bookingRepo.countByStatus(2), p = bookingRepo.countByStatus(3);
        double rate = total > 0 ? (double) c / total * 100 : 0;
        return DashboardStatsResponse.builder()
                .totalTickets(ticketRepo.count()).totalBookings(total)
                .confirmedBookings(c).rejectedBookings(r).pendingBookings(p)
                .totalRevenue(bookingRepo.sumRevenue()).successRate(Math.round(rate * 100.0) / 100.0)
                .totalUsers(userRepo.countAllUsers()).activeUsers(userRepo.countActiveUsers())
                .lockedUsers(userRepo.countLockedUsers()).verifiedUsers(userRepo.countVerifiedUsers()).build();
    }

    public List<UserResponse> allUsers() {
        return userRepo.findAll().stream().filter(u -> u.getRole().name().equals("USER"))
                .map(authSvc::toUserRes).collect(Collectors.toList());
    }
    public List<UserResponse> usersByStatus(int s) {
        return userRepo.findByStatus(s).stream().filter(u -> u.getRole().name().equals("USER"))
                .map(authSvc::toUserRes).collect(Collectors.toList());
    }

    @Transactional public void lock(Long id) { setStatus(id, UserStatus.LOCKED.getValue()); }
    @Transactional public void unlock(Long id) { setStatus(id, UserStatus.ACTIVE.getValue()); }

    private void setStatus(Long id, int s) {
        var u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setStatus(s); userRepo.save(u);
    }
}