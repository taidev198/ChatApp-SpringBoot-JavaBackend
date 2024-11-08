package com.alibou.websocket.notification;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.RedirectView;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private static int i =1;
    private final List<SseEmitter> emitters = new ArrayList<>();
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/stream")
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter();
        emitters.add(emitter);

        // Remove emitter when completed or timed out
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        someBusinessMethod();
        return emitter;
    }

    @GetMapping
    public String home(Model model) {
        return "notify";
    }

//    @Scheduled(initialDelay=6000, fixedRate=6000)
//    @Async
    public void someBusinessMethod() {
        System.out.println("sending");
        String message = "A new notification!" + ++i;
        //notificationService.createNotification(1L, message,"WARNING" );
        notificationService.sendNotification(message, emitters);
    }
//
//    @GetMapping("/")
//    public String index(Model model) {
//        Long userId = 1L; // Assume a fixed user for demonstration; this can come from a logged-in user's session
//        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
//        model.addAttribute("notifications", notifications);
//        return "notify"; // Maps to index.html in resources/templates/
//    }
//
    @GetMapping("/unread/{userId}")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId, Model model) {
         return notificationService.getUnreadNotifications(userId);
    }

    @PostMapping("/markAsRead/{id}")
    public RedirectView markAsRead(HttpServletRequest request,
                                   @PathVariable Long id,
                                   RedirectAttributes redirectAttrs) {
        notificationService.markAsRead(id);
        return new RedirectView("/", true);
    }

}
