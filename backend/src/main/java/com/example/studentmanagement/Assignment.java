package com.example.studentmanagement;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private AssignmentTask task;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String title;

    private String fileName;

    private String filePath;

    private LocalDateTime submittedAt;

    private String grade; // A, B, C, D, F or numeric

    @Column(length = 500)
    private String feedback;

    private String status; // "SUBMITTED", "GRADED", "PENDING"
}
