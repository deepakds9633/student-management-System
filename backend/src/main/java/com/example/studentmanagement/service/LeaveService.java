package com.example.studentmanagement.service;

import com.example.studentmanagement.Attendance;
import com.example.studentmanagement.Leave;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Leave applyLeave(Leave leave) {
        leave.setStatus("PENDING");
        return leaveRepository.save(leave);
    }

    public List<Leave> getLeavesByStudent(Long studentId) {
        return leaveRepository.findByStudentIdOrderByAppliedAtDesc(studentId);
    }

    public List<Leave> getPendingLeaves() {
        return leaveRepository.findByStatus("PENDING");
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAllByOrderByAppliedAtDesc();
    }

    public Leave approveLeave(Long leaveId, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        leave.setStatus("APPROVED");
        leave.setRemarks(remarks);

        // Auto-update attendance as "Leave" for the date range
        Student student = leave.getStudent();
        LocalDate current = leave.getStartDate();
        while (!current.isAfter(leave.getEndDate())) {
            Attendance attendance = attendanceRepository
                    .findByStudentIdAndDate(student.getId(), current)
                    .orElse(new Attendance());
            attendance.setStudent(student);
            attendance.setDate(current);
            attendance.setStatus("Leave");
            attendanceRepository.save(attendance);
            current = current.plusDays(1);
        }

        return leaveRepository.save(leave);
    }

    public Leave rejectLeave(Long leaveId, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        leave.setStatus("REJECTED");
        leave.setRemarks(remarks);
        return leaveRepository.save(leave);
    }
}
