package com.example.studentmanagement.repository;

import com.example.studentmanagement.AssignmentTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentTaskRepository extends JpaRepository<AssignmentTask, Long> {
    List<AssignmentTask> findBySubject(String subject);

    List<AssignmentTask> findAllByOrderByCreatedAtDesc();
}
