package com.example.studentmanagement.repository;

import com.example.studentmanagement.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    Optional<Student> findByUserId(Long userId);

    Boolean existsByEmail(String email);
}
