package com.example.doan.repository;

import com.example.doan.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket,Long> {
    @Query("SELECT t FROM Ticket t WHERE t.isActive=1 " +
            "AND (:dep IS NULL OR t.departure=:dep) " +
            "AND (:dest IS NULL OR t.destination=:dest) " +
            "AND (:type IS NULL OR t.type=:type) ORDER BY t.id")
    List<Ticket> findFiltered(@Param("dep") String dep,
                              @Param("dest") String dest,
                              @Param("type") String type
    );
    @Query("SELECT t FROM Ticket t WHERE t.isActive = 1 " +
            "AND (:dep IS NULL OR t.departure = :dep) " +
            "AND (:dest IS NULL OR t.destination = :dest) " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (t.offDay IS NULL OR t.offDay = '' OR LOWER(t.offDay) != LOWER(:dayOfWeek)) " +
            "ORDER BY t.id")
    List<Ticket> findFilteredByDate(
            @Param("dep") String dep,
            @Param("dest") String dest,
            @Param("type") String type,
            @Param("dayOfWeek") String dayOfWeek
    );
}
