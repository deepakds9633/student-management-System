package com.example.studentmanagement;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String recipientRole; // "ALL", "STAFF", "STUDENT"

    private String title;

    private String category; // "NOTICE", "ANNOUNCEMENT", "EXAM", "EVENT"

    private String fileUrl; // PDF attachment path

    private String postedBy;
    private String priority; // "LOW", "MEDIUM", "HIGH"

    @Column(nullable = false)
    private boolean active = true;

    private String type; // "SYSTEM", "MANUAL"

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
