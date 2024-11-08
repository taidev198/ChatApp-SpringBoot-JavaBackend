package com.alibou.websocket.chatroom;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "chat_room")
@Entity

public class ChatRoom {
    @Id
    @UuidGenerator
    private String id;
    private String chatId;
    private String senderId;
    private String recipientId;
}
