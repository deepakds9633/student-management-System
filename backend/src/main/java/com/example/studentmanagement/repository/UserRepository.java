package com.example.studentmanagement.repository;

import com.example.studentmanagement.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    long countByRole(com.example.studentmanagement.Role role);

    java.util.List<User> findByRole(com.example.studentmanagement.Role role);
}
