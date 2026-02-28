package com.example.studentmanagement.repository;

import com.example.studentmanagement.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByUserId(Long userId);
}
