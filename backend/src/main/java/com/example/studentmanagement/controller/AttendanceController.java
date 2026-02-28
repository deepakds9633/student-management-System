package com.example.studentmanagement.controller;

import com.example.studentmanagement.Attendance;
import com.example.studentmanagement.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

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
    public List<Attendance> getAttendanceByStudent(@PathVariable("studentId") Long studentId) {
        return attendanceService.getAttendanceByStudent(studentId);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('STAFF')")
    public List<Attendance> getAttendanceByDate(@PathVariable("date") String date) {
        return attendanceService.getAttendanceByDate(LocalDate.parse(date));
    }
}
