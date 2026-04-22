package com.example.doan.repository;

import com.example.doan.entity.User;
import com.example.doan.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByStatus(Integer status);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'USER' ")
    long countAllUsers();
    @Query("SELECT COUNT(u) FROM User u WHERE u.role='USER' AND u.status=1")
    long countActiveUsers();
    @Query("SELECT COUNT(u) FROM User u WHERE u.role='USER' AND u.status=0")
    long countLockedUsers();
    @Query("SELECT COUNT(u) FROM User u WHERE u.role='USER' AND u.phone IS NOT NULL")
    long countVerifiedUsers();
}
