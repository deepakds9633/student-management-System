package com.example.studentmanagement;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "marks")
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String examType; // "Internal", "Assignment", "Final"

    @Column(nullable = true)
    private Integer marksObtained;

    @Column(nullable = false)
    private int maxMarks;
}
