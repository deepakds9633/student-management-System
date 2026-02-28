package com.example.studentmanagement.repository;

import com.example.studentmanagement.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByStudentId(Long studentId);

    List<Leave> findByStatus(String status);

    List<Leave> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    List<Leave> findAllByOrderByAppliedAtDesc();
}
