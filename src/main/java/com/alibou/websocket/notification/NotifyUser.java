package com.alibou.websocket.notification;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;


@Getter
@Setter
@Entity
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Table(name = "notify_user")
public class NotifyUser implements Serializable {
    @Serial
    private static final long serialVersionUID = 7156126077883281623L;
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long userId;
    private Long notifyId;
    private boolean readMessage;
}
