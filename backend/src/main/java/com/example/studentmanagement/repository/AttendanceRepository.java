package com.example.studentmanagement.repository;

import com.example.studentmanagement.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByDate(LocalDate date);

    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    long countByDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, String status);

    long countByDateBetween(LocalDate startDate, LocalDate endDate);

    long countByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT a.date, COUNT(a) FROM Attendance a WHERE a.date BETWEEN :startDate AND :endDate AND a.status = 'Present' GROUP BY a.date ORDER BY a.date")
    List<Object[]> findDailyPresentCounts(
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate);
}
