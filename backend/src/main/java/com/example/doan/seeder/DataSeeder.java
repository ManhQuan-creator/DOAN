package com.example.doan.seeder;

import com.example.doan.entity.Seat;
import com.example.doan.entity.Ticket;
import com.example.doan.entity.User;
import com.example.doan.enums.UserRole;
import com.example.doan.enums.UserStatus;
import com.example.doan.repository.SeatRepository;
import com.example.doan.repository.TicketRepository;
import com.example.doan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final TicketRepository ticketRepo;
    private final SeatRepository seatRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.findByEmail("quanmn2004@gmail.com").isEmpty()) {
            userRepo.save(User.builder()
                    .email("quanmn2004@gmail.com")
                    .password(encoder.encode("admin123456"))
                    .firstname("Quan").lastname("Ngo").role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE.getValue()).type(1).build());
            log.info("Admin created: quanmn2004@gmail.com / admin123456");
        }
        if (ticketRepo.count() == 0) {
            seed("Hà Nội","Thái Nguyên","08:00 AM","04:30 PM","08:30 min","Friday",
                    "[\"Water Bottle\",\"Pillow\",\"Wifi\"]", new long[]{1000000,1000000,1000000,1000000,900000,900000,900000,900000,800000,800000,800000,800000,700000,700000,700000,700000,600000,600000,600000,600000,500000,500000,500000,500000,400000,400000,400000,400000,400000,400000,400000,400000});
            seed("Thái Bình","Hà Nội","09:00 AM","05:30 PM","08:30 min","Friday",
                    "[\"Water Bottle\",\"Pillow\",\"Wifi\"]", new long[]{950000,950000,950000,950000,850000,850000,850000,850000});
            seed("Hà Nam","Hà Nội","10:00 AM","06:30 PM","08:30 min","Friday",
                    "[\"Water Bottle\",\"Pillow\",\"Wifi\"]", new long[]{1000000,1000000,1000000,1000000,900000,900000,900000,900000,800000,800000,800000,800000,700000,700000,700000,700000});
            seed("Nam Định","Hà Nội","11:00 AM","07:30 PM","08:30 min","Friday",
                    "[\"Water Bottle\",\"Pillow\",\"Wifi\"]", new long[]{900000,900000,900000,900000,800000,800000,800000,800000});
            seed("Thái Bình","Thái Nguyên","11:00 PM","08:30 AM","08:30 min","Friday",
                    "[\"Water Bottle\",\"Pillow\",\"Wifi\"]", new long[]{1000000,1000000,1000000,1000000,900000,900000,900000,900000,800000,800000,800000,800000});
            seed("Hà Nội","Bắc Giang","07:00 AM","03:00 PM","08:00 min","Monday",
                    "[\"Water Bottle\",\"Pillow\"]",new long[]{900000,900000,900000,900000,800000,800000,800000,800000});
            seed("Hà Nội","Hồ Chí Minh","06:00 AM","02:00 PM","08:00 min","Tuesday",
                    "[\"Water Bottle\",\"Wifi\"]",new long[]{850000,850000,850000,850000,750000,750000,750000,750000});
            seed("Hải Phòng","Hà Nội","05:00 AM","01:00 PM","08:00 min","Wednesday",
                    "[\"Pillow\",\"Wifi\"]",new long[]{800000,800000,800000,800000,700000,700000,700000,700000});
            log.info("Seeded {} tickets", ticketRepo.count());
        }
    }

    private void seed(String dep, String dest, String st, String et, String tt, String od, String fac, long[] prices) {
        Ticket t = ticketRepo.save(Ticket.builder().departure(dep).destination(dest).seatLayout("2x2").type("AC")
                .startTime(st).endTime(et).travelTime(tt).offDay(od).facilities(fac).isActive(1).build());
        String[] rows = {"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"};
        for (int i = 0; i < prices.length; i++)
            seatRepo.save(Seat.builder().ticket(t).name(rows[i/4]+((i%4)+1)).price(prices[i]).seatOrder(i+1).build());
    }
}