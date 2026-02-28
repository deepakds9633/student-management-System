package com.example.studentmanagement.controller;

import com.example.studentmanagement.Attendance;
import com.example.studentmanagement.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.Student;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Student getStudentFromPrincipal(Principal principal) {
        if (principal == null)
            return null;
        return userRepository.findByUsername(principal.getName())
                .flatMap(user -> studentRepository.findByUserId(user.getId()))
                .orElse(null);
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('STAFF')")
    public List<Attendance> markBulkAttendance(@RequestBody List<Attendance> attendanceList) {
        return attendanceService.markBulkAttendance(attendanceList);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public List<Attendance> getAttendanceByStudent(@PathVariable("studentId") String studentId, Principal principal) {
        boolean isStaff = userRepository.findByUsername(principal.getName())
                .map(u -> u.getRole().name().equals("STAFF")).orElse(false);

        if (!isStaff || studentId.equals("me")) {
            Student student = getStudentFromPrincipal(principal);
            if (student == null)
                return List.of();
            return attendanceService.getAttendanceByStudent(student.getId());
        }

        try {
            return attendanceService.getAttendanceByStudent(Long.valueOf(studentId));
        } catch (NumberFormatException e) {
            return List.of();
        }
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('STAFF')")
    public List<Attendance> getAttendanceByDate(@PathVariable("date") String date) {
        return attendanceService.getAttendanceByDate(LocalDate.parse(date));
    }
}
