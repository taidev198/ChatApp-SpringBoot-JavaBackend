package com.alibou.websocket.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotifyUserRepository extends JpaRepository<NotifyUser, Long> {
    Optional<NotifyUser> findNotifyUserByNotifyId(Long notificationId);

    List<NotifyUser> findNotifyUserByUserId(Long userId);

    List<NotifyUser> findNotifyUserByUserIdAndReadMessageFalse(Long userId);
}
