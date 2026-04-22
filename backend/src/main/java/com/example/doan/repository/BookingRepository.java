package com.example.doan.repository;

import com.example.doan.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String code);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByStatusOrderByCreatedAtDesc(Integer status);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByPaymentStatus(Integer paymentStatus);

    @Query("SELECT bs.seat.id FROM BookingSeat bs JOIN bs.booking b " +
            "WHERE b.ticket.id=:tid AND b.dateStart=:date AND b.status<>2")

    List<Long> findBookedSeatIds(@Param("tid") Long tid, @Param("date") String date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status=:s")
    long countByStatus(@Param("s") Integer s);

    @Query("SELECT COALESCE(SUM(b.totalPrice),0) FROM Booking b WHERE b.status=1")
    long sumRevenue();
//tìm hết các chưa thanh toán trc 10p
    @Query("SELECT b FROM Booking b " +
            "WHERE b.status = 3 " +
            "AND b.paymentStatus = 0 " +
            "AND b.createdAt < :cutoff")
    List<Booking> findPendingUnpaidBefore(@Param("cutoff") LocalDateTime cutoff);

    // Query tìm theo cả booking status và payment status
    @Query("SELECT b FROM Booking b WHERE b.status=:s AND b.paymentStatus=:ps ORDER BY b.createdAt DESC")
    List<Booking> findByStatusAndPaymentStatus(@Param("s") Integer status, @Param("ps") Integer paymentStatus);
}
