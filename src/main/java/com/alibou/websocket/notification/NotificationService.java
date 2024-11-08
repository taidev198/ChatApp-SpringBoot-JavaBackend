package com.alibou.websocket.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private final NotifyUserRepository notifyUserRepository;

    public void sendNotification(Object message, List<SseEmitter> emitters) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        message = getUnreadNotifications(1L);
        // Send event to each client
        Object finalMessage = message;
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().name("notification").data(finalMessage));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        });

        // Remove disconnected clients
        emitters.removeAll(deadEmitters);
    }

    public void createNotification(Long userId, String message, String type) {
       Notification rs = notificationRepository.save(Notification.builder()
               .timestamp(LocalDateTime.now())
               .message(message)
               .type(type).build());
        notifyUserRepository.save(
                NotifyUser.builder()
                .userId(userId)
                .notifyId(rs.getId())
                .readMessage(false)
                .build()
        );
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        List<NotifyUser> list = notifyUserRepository.findNotifyUserByUserIdAndReadMessageFalse(userId);
        List<Notification> notifications = new ArrayList<>();
         list.forEach(notifyUser -> notifications.add(notificationRepository.findById(notifyUser.getNotifyId()).get()));
         return notifications;
    }

    public void markAsRead(Long notificationId) {
        NotifyUser notifyUser = notifyUserRepository.findNotifyUserByNotifyId(notificationId).orElseThrow();
        notifyUser.setReadMessage(true);
        notifyUserRepository.save(notifyUser);
    }
}
