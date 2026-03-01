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
import com.example.studentmanagement.repository.UserRepository;
import java.security.Principal;

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

    @Autowired
    private UserRepository userRepository;

    private Student getStudentFromPrincipal(Principal principal) {
        if (principal == null)
            return null;
        return userRepository.findByUsername(principal.getName())
                .flatMap(user -> studentRepository.findByUserId(user.getId()))
                .orElse(null);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            Student student = getStudentFromPrincipal(principal);

            // If staff is applying on behalf of a student, they might provide an ID
            // but for students, we MUST use their own identity
            boolean isStaff = userRepository.findByUsername(principal.getName())
                    .map(u -> u.getRole().name().equals("STAFF")).orElse(false);

            if (isStaff) {
                Long sid = null;
                if (body.containsKey("student")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> studentMap = (Map<String, Object>) body.get("student");
                    if (studentMap.containsKey("id"))
                        sid = Long.valueOf(studentMap.get("id").toString());
                }
                if (body.containsKey("studentId"))
                    sid = Long.valueOf(body.get("studentId").toString());

                if (sid != null) {
                    final Long finalSid = sid;
                    student = studentRepository.findById(finalSid)
                            .orElseGet(() -> studentRepository.findByUserId(finalSid).orElse(null));
                }
            }

            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Authorized student record not found."));
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
    public ResponseEntity<List<Leave>> getStudentLeaves(@PathVariable("studentId") String studentId,
            Principal principal) {
        boolean isStaff = userRepository.findByUsername(principal.getName())
                .map(u -> u.getRole().name().equals("STAFF")).orElse(false);

        if (!isStaff || studentId.equals("me")) {
            // Enforce student ownership
            Student currentStudent = getStudentFromPrincipal(principal);
            if (currentStudent == null)
                return ResponseEntity.status(403).build();
            return ResponseEntity.ok(leaveService.getLeavesByStudent(currentStudent.getId()));
        }

        // Staff flow - use the provided studentId (must be numeric)
        try {
            Long id = Long.valueOf(studentId);
            List<Leave> leaves = leaveService.getLeavesByStudent(id);
            if (leaves.isEmpty()) {
                Student student = studentRepository.findByUserId(id).orElse(null);
                if (student != null) {
                    Long existingStudentId = student.getId();
                    leaves = leaveService.getLeavesByStudent(existingStudentId);
                }
            }
            return ResponseEntity.ok(leaves);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
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
    public ResponseEntity<Leave> approveLeave(@PathVariable("id") @org.springframework.lang.NonNull Long id,
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
    public ResponseEntity<Leave> rejectLeave(@PathVariable("id") @org.springframework.lang.NonNull Long id,
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
