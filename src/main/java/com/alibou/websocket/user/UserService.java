package com.alibou.websocket.user;


import com.alibou.websocket.chat.ChatMessageService;
import com.alibou.websocket.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    public void saveUser(User user) {
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public void disconnect(User user) {
        var storedUser = repository.findById(user.getId()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return repository.findAllByStatus(Status.ONLINE);
    }

    public User login(String username, String password) {
        var storedUser = repository.findByUsername(username).orElse(null);
        if (storedUser != null) {
            if (Objects.equals(storedUser.getPassword(), password)) {
                System.out.println("success");
                return storedUser;
            }
        }
        return null;
    }

    public List<Optional<User>> findAllByUsername(String senderId) {
        List<String> receiverId = chatRoomService.findReceiverId(senderId);
        var list = new ArrayList<>(receiverId.
                stream().map(repository::findByUsername).toList());
       return list.stream().sorted(
                ((o1, o2) -> {
                    var chatMessage = chatMessageService.findChatMessages(senderId, o1.get().getUsername());
                    var chatMessage1 = chatMessageService.findChatMessages(senderId, o2.get().getUsername());
                    return chatMessage1.get(chatMessage1.size() -1).getTimestamp().after(chatMessage.get(chatMessage.size() -1).getTimestamp()) ? 1 : -1;
                })).toList();
    }
}
