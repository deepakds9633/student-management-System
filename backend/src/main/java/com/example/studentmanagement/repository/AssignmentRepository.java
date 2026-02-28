package com.example.studentmanagement.repository;

import com.example.studentmanagement.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByStudentId(Long studentId);

    List<Assignment> findBySubject(String subject);

    List<Assignment> findByStudentIdAndSubject(Long studentId, String subject);

    List<Assignment> findByTaskId(Long taskId);

    List<Assignment> findByStudentIdAndTaskId(Long studentId, Long taskId);

    List<Assignment> findAllByOrderBySubmittedAtDesc();
}
