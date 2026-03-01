package com.example.studentmanagement.controller;

import com.example.studentmanagement.Notification;
import com.example.studentmanagement.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600, allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Use absolute path in user's home directory
    private static final String UPLOAD_DIR = System.getProperty("user.home") + File.separator + "student-mgmt-uploads"
            + File.separator + "notices" + File.separator;

    @GetMapping
    public List<Notification> getAllNotifications(
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "type", required = false) String type) {

        if ("ADMIN".equals(role)) {
            return notificationRepository.findByActiveTrueOrderByTimestampDesc();
        }

        if (role != null && !role.isEmpty()) {
            if (type != null && !type.isEmpty()) {
                return notificationRepository.findByTypeAndRecipientRoleInAndActiveTrueOrderByTimestampDesc(
                        type, Arrays.asList(role, "ALL"));
            }
            return notificationRepository.findByRecipientRoleInAndActiveTrueOrderByTimestampDesc(
                    Arrays.asList(role, "ALL"));
        }

        return notificationRepository.findByActiveTrueOrderByTimestampDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable("id") @org.springframework.lang.NonNull Long id) {
        return notificationRepository.findById(id)
                .filter(Notification::isActive)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    public List<Notification> getNotificationsByRole(@PathVariable("role") String role) {
        return getAllNotifications(role, null);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        if (notification.getType() == null)
            notification.setType("MANUAL");
        notification.setActive(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PostMapping("/with-file")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> createNotificationWithFile(
            @RequestParam("message") String message,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", defaultValue = "NOTICE") String category,
            @RequestParam(value = "priority", defaultValue = "MEDIUM") String priority,
            @RequestParam(value = "recipientRole", defaultValue = "ALL") String recipientRole,
            @RequestParam(value = "postedBy", required = false) String postedBy,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setTitle(
                title != null && !title.isEmpty() ? title : message.substring(0, Math.min(50, message.length())));
        notification.setCategory(category);
        notification.setPriority(priority);
        notification.setRecipientRole(recipientRole);
        notification.setPostedBy(postedBy);
        notification.setType("MANUAL");
        notification.setActive(true);

        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath))
                    Files.createDirectories(uploadPath);

                String originalName = file.getOriginalFilename();
                String safeName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
                String fileName = System.currentTimeMillis() + "_" + safeName;

                Path destination = uploadPath.resolve(fileName);
                file.transferTo(destination.toFile());

                notification.setFileUrl("/api/files/notices/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getNewCount(
            @RequestParam(value = "since", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            @RequestParam(value = "role", required = false) String role) {

        LocalDateTime sinceDate = (since != null) ? since : LocalDateTime.now().minusDays(7);

        long count;
        if ("ADMIN".equals(role)) {
            count = notificationRepository.countByTimestampAfterAndActiveTrue(sinceDate);
        } else if (role != null && !role.isEmpty()) {
            count = notificationRepository.countByTimestampAfterAndActiveTrueAndRecipientRoleIn(
                    sinceDate, Arrays.asList(role, "ALL"));
        } else {
            count = notificationRepository.countByTimestampAfterAndActiveTrue(sinceDate);
        }

        System.out.println(
                "DEBUG: Fetching unread count since " + sinceDate + " for role: " + role + ". Result: " + count);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Notification> updateNotification(
            @PathVariable("id") @org.springframework.lang.NonNull Long id,
            @RequestBody Notification updated) {
        return notificationRepository.findById(id).map(notif -> {
            if (updated.getTitle() != null)
                notif.setTitle(updated.getTitle());
            if (updated.getMessage() != null)
                notif.setMessage(updated.getMessage());
            if (updated.getCategory() != null)
                notif.setCategory(updated.getCategory());
            if (updated.getPriority() != null)
                notif.setPriority(updated.getPriority());
            if (updated.getRecipientRole() != null)
                notif.setRecipientRole(updated.getRecipientRole());
            notif.setActive(updated.isActive());
            return ResponseEntity.ok(notificationRepository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable("id") @org.springframework.lang.NonNull Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setActive(false);
            notificationRepository.save(notif);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
