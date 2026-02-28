package com.example.studentmanagement.controller;

import com.example.studentmanagement.Leave;
import com.example.studentmanagement.Notification;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.repository.NotificationRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> body) {
        try {
            // Handle both student.id and userId lookups
            Long studentId = null;

            if (body.containsKey("student")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> studentMap = (Map<String, Object>) body.get("student");
                if (studentMap.containsKey("id")) {
                    studentId = Long.valueOf(studentMap.get("id").toString());
                }
            }
            if (body.containsKey("studentId")) {
                studentId = Long.valueOf(body.get("studentId").toString());
            }

            // Try to find student - first by student ID, then by user ID
            Student student = null;
            if (studentId != null) {
                student = studentRepository.findById(studentId).orElse(null);
                if (student == null) {
                    // Try as user ID
                    student = studentRepository.findByUserId(studentId).orElse(null);
                }
            }

            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Student not found with id: " + studentId));
            }

            Leave leave = new Leave();
            leave.setStudent(student);
            leave.setStartDate(java.time.LocalDate.parse(body.get("startDate").toString()));
            leave.setEndDate(java.time.LocalDate.parse(body.get("endDate").toString()));
            leave.setReason(body.get("reason").toString());

            Leave savedLeave = leaveService.applyLeave(leave);

            // Notify Staff
            Notification n = new Notification();
            n.setTitle("New Leave Application");
            n.setMessage("Student " + student.getName() + " applied for leave from " + leave.getStartDate() + " to "
                    + leave.getEndDate());
            n.setRecipientRole("STAFF");
            n.setCategory("NOTICE");
            n.setType("SYSTEM");
            n.setActive(true);
            notificationRepository.save(n);

            return ResponseEntity.ok(savedLeave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<List<Leave>> getStudentLeaves(@PathVariable("studentId") Long studentId) {
        // Try as student ID first, then as user ID
        List<Leave> leaves = leaveService.getLeavesByStudent(studentId);
        if (leaves.isEmpty()) {
            Student student = studentRepository.findByUserId(studentId).orElse(null);
            if (student != null) {
                leaves = leaveService.getLeavesByStudent(student.getId());
            }
        }
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Leave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Leave> approveLeave(@PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        Leave approvedLeave = leaveService.approveLeave(id, remarks);

        // Notify Student
        Notification n = new Notification();
        n.setTitle("Leave Application Approved");
        n.setMessage("Your leave from " + approvedLeave.getStartDate() + " to " + approvedLeave.getEndDate()
                + " has been approved.");
        n.setRecipientRole("STUDENT");
        n.setCategory("NOTICE");
        n.setType("SYSTEM");
        n.setActive(true);
        notificationRepository.save(n);

        return ResponseEntity.ok(approvedLeave);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Leave> rejectLeave(@PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        Leave rejectedLeave = leaveService.rejectLeave(id, remarks);

        // Notify Student
        Notification n = new Notification();
        n.setTitle("Leave Application Rejected");
        n.setMessage("Your leave from " + rejectedLeave.getStartDate() + " to " + rejectedLeave.getEndDate()
                + " has been rejected.");
        n.setRecipientRole("STUDENT");
        n.setCategory("NOTICE");
        n.setType("SYSTEM");
        n.setActive(true);
        notificationRepository.save(n);

        return ResponseEntity.ok(rejectedLeave);
    }
}
