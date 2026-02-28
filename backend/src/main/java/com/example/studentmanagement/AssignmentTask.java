package com.example.studentmanagement;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "assignment_tasks")
public class AssignmentTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDateTime deadline;

    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean published = true;

    // Optional: link to the staff who created it
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}
