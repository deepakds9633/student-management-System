package com.example.studentmanagement;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "students")
public class Student {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @OneToOne(cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String course;

    private String year;

    private String semester;

    private String department;

    private String phoneNumber;

    @Column(length = 500)
    private String address;
}
