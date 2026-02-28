package com.example.studentmanagement.service;

import com.example.studentmanagement.Attendance;
import com.example.studentmanagement.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Attendance markAttendance(Attendance attendance) {
        // Check if attendance already exists for student and date
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndDate(attendance.getStudent().getId(),
                attendance.getDate());
        if (existing.isPresent()) {
            Attendance update = existing.get();
            update.setStatus(attendance.getStatus());
            return attendanceRepository.save(update);
        }
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> markBulkAttendance(List<Attendance> attendances) {
        for (Attendance attendance : attendances) {
            Optional<Attendance> existing = attendanceRepository.findByStudentIdAndDate(attendance.getStudent().getId(),
                    attendance.getDate());
            if (existing.isPresent()) {
                Attendance update = existing.get();
                update.setStatus(attendance.getStatus());
                attendanceRepository.save(update);
            } else {
                attendanceRepository.save(attendance);
            }
        }
        return attendances;
    }

    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
}
