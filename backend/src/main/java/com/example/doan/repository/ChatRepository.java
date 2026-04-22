package com.example.doan.repository;

import com.example.doan.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<Chat> findAllByOrderByUpdatedAtDesc();
}
