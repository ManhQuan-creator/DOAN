package com.example.doan.repository;

import com.example.doan.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat,Long> {
    List<Seat> findByTicketIdOrderBySeatOrderAsc(Long ticketId);
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids")
    List<Seat> findByIds(@Param("ids") List<Long> ids);
}
