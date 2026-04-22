package com.example.doan.repository;

import com.example.doan.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.otp = :otp AND o.type = :type AND o.used = false")
    Optional<OtpToken> findByEmailAndOtpAndType(
            @Param("email") String email,
            @Param("otp") String otp,
            @Param("type") String type
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.email = :email AND o.type = :type")
    void deleteByEmailAndType(String email, String type);
//tìm otp mới
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email " +
            "AND o.type = :type AND o.used = false " +
            "ORDER BY o.expiryDate DESC")
    List<OtpToken> findLatestOtp(String email, String type);
}
