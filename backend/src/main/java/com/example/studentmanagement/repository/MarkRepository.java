package com.example.studentmanagement.repository;

import com.example.studentmanagement.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);

    List<Mark> findByStudentIdAndExamType(Long studentId, String examType);

    boolean existsByStudentIdAndSubjectAndExamType(Long studentId, String subject, String examType);

    java.util.Optional<Mark> findByStudentIdAndSubjectAndExamType(Long studentId, String subject, String examType);

    @org.springframework.data.jpa.repository.Query("SELECT m.subject as subject, AVG(m.marksObtained) as average, AVG(m.maxMarks) as maxAverage FROM Mark m GROUP BY m.subject")
    List<Object[]> findAverageMarksBySubject();

    @org.springframework.data.jpa.repository.Query("SELECT s.name, s.course, SUM(m.marksObtained), SUM(m.maxMarks) FROM Mark m JOIN m.student s GROUP BY s.id, s.name, s.course ORDER BY (SUM(m.marksObtained) * 100.0 / SUM(m.maxMarks)) DESC")
    List<Object[]> findTopPerformers();

    @org.springframework.data.jpa.repository.Query("SELECT s.name, s.course, SUM(m.marksObtained), SUM(m.maxMarks) FROM Mark m JOIN m.student s GROUP BY s.id, s.name, s.course ORDER BY (SUM(m.marksObtained) * 100.0 / SUM(m.maxMarks)) ASC")
    List<Object[]> findLowPerformers();
}
