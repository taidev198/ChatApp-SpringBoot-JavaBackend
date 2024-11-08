package com.alibou.websocket.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Object> {
    List<ChatMessage> findByChatId(String chatId);
}
