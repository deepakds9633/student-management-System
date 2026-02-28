package com.example.studentmanagement.repository;

import com.example.studentmanagement.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientRoleInAndActiveTrueOrderByTimestampDesc(List<String> roles);

    List<Notification> findByActiveTrueOrderByTimestampDesc();

    List<Notification> findByTypeAndRecipientRoleInAndActiveTrueOrderByTimestampDesc(String type, List<String> roles);

    long countByTimestampAfterAndActiveTrueAndRecipientRoleIn(java.time.LocalDateTime since, List<String> roles);

    long countByTimestampAfterAndActiveTrue(java.time.LocalDateTime since);
}
