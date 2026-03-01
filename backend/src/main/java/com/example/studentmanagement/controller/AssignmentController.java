package com.example.studentmanagement.controller;

import com.example.studentmanagement.Assignment;
import com.example.studentmanagement.AssignmentTask;
import com.example.studentmanagement.Notification;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.repository.AssignmentRepository;
import com.example.studentmanagement.repository.AssignmentTaskRepository;
import com.example.studentmanagement.repository.NotificationRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.studentmanagement.repository.UserRepository;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentTaskRepository assignmentTaskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    private Student getStudentFromPrincipal(Principal principal) {
        if (principal == null)
            return null;
        return userRepository.findByUsername(principal.getName())
                .flatMap(user -> studentRepository.findByUserId(user.getId()))
                .orElse(null);
    }

    private static final String UPLOAD_DIR = System.getProperty("user.home") + File.separator + "student-mgmt-uploads"
            + File.separator + "assignments" + File.separator;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<?> submitAssignment(
            @RequestParam(value = "studentId", required = false) Long studentId,
            @RequestParam("taskId") @org.springframework.lang.NonNull Long taskId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {

        AssignmentTask task = assignmentTaskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Assignment Task not found"));
        }

        // Resolve student
        Student student = getStudentFromPrincipal(principal);

        // Staff might specify a studentId for manual entry
        boolean isStaff = userRepository.findByUsername(principal.getName())
                .map(u -> u.getRole().name().equals("STAFF")).orElse(false);

        if (isStaff && studentId != null) {
            student = studentRepository.findById(studentId)
                    .orElseGet(() -> studentRepository.findByUserId(studentId).orElse(null));
        }

        if (student == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Authorized student record not found"));
        }

        Assignment assignment = new Assignment();
        assignment.setStudent(student);
        assignment.setTask(task);
        assignment.setSubject(task.getSubject());
        assignment.setTitle(task.getTitle());
        assignment.setSubmittedAt(LocalDateTime.now());
        assignment.setStatus("SUBMITTED");

        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String originalName = file.getOriginalFilename();
                String safeName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
                String fileName = System.currentTimeMillis() + "_" + safeName;
                Path dest = uploadPath.resolve(fileName);
                file.transferTo(dest.toFile());
                assignment.setFileName(originalName);
                assignment.setFilePath(dest.toAbsolutePath().toString());
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "File upload failed: " + e.getMessage()));
            }
        }

        Assignment saved = assignmentRepository.save(assignment);

        // Notify Staff
        Notification n = new Notification();
        n.setTitle("New Assignment Submission");
        n.setMessage("Student " + student.getName() + " submitted " + task.getTitle());
        n.setRecipientRole("STAFF");
        n.setCategory("NOTICE");
        n.setType("SYSTEM");
        n.setActive(true);
        notificationRepository.save(n);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<List<Assignment>> getByStudent(@PathVariable("studentId") String studentId,
            Principal principal) {
        boolean isStaff = userRepository.findByUsername(principal.getName())
                .map(u -> u.getRole().name().equals("STAFF")).orElse(false);

        if (!isStaff || studentId.equals("me")) {
            Student student = getStudentFromPrincipal(principal);
            if (student == null)
                return ResponseEntity.ok(List.of());
            return ResponseEntity.ok(assignmentRepository.findByStudentId(student.getId()));
        }

        try {
            Long sid = Long.valueOf(studentId);
            List<Assignment> list = assignmentRepository.findByStudentId(sid);
            if (list.isEmpty()) {
                Student student = studentRepository.findByUserId(sid).orElse(null);
                if (student != null) {
                    list = assignmentRepository.findByStudentId(student.getId());
                }
            }
            return ResponseEntity.ok(list);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Assignment>> getAll() {
        return ResponseEntity.ok(assignmentRepository.findAllByOrderBySubmittedAtDesc());
    }

    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> gradeAssignment(@PathVariable("id") @org.springframework.lang.NonNull Long id,
            @RequestBody Map<String, String> body) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setGrade(body.getOrDefault("grade", ""));
        assignment.setFeedback(body.getOrDefault("feedback", ""));
        assignment.setStatus("GRADED");
        Assignment saved = assignmentRepository.save(assignment);

        // Notify Student
        Notification n = new Notification();
        n.setTitle("Assignment Graded");
        n.setMessage("Your submisson for " + assignment.getTitle() + " has been graded: " + assignment.getGrade());
        n.setRecipientRole("STUDENT");
        n.setCategory("NOTICE");
        n.setType("SYSTEM");
        n.setActive(true);
        notificationRepository.save(n);

        return ResponseEntity.ok(saved);
    }

    // New endpoints for Assignment Tasks
    @PostMapping("/tasks")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<AssignmentTask> createTask(@RequestBody AssignmentTask task) {
        AssignmentTask saved = assignmentTaskRepository.save(task);

        // Notify Students
        Notification n = new Notification();
        n.setTitle("New Assignment Published");
        n.setMessage("A new assignment '" + task.getTitle() + "' has been published for " + task.getSubject());
        n.setRecipientRole("STUDENT");
        n.setCategory("NOTICE");
        n.setType("SYSTEM");
        n.setActive(true);
        notificationRepository.save(n);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<List<AssignmentTask>> getAllTasks() {
        return ResponseEntity.ok(assignmentTaskRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/tasks/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('STAFF')")
    public ResponseEntity<AssignmentTask> getTaskById(@PathVariable @org.springframework.lang.NonNull Long id) {
        return ResponseEntity.ok(assignmentTaskRepository.findById(id).orElse(null));
    }

    @GetMapping("/submissions/task/{taskId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Assignment>> getSubmissionsByTask(
            @PathVariable @org.springframework.lang.NonNull Long taskId) {
        return ResponseEntity.ok(assignmentRepository.findByTaskId(taskId));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> getAnalytics() {
        List<Assignment> all = assignmentRepository.findAll();
        Map<String, List<Assignment>> bySubject = all.stream()
                .filter(a -> a.getGrade() != null && !a.getGrade().isEmpty())
                .collect(Collectors.groupingBy(Assignment::getSubject));

        java.util.List<Map<String, Object>> stats = new java.util.ArrayList<>();
        for (String sub : bySubject.keySet()) {
            List<Assignment> subs = bySubject.get(sub);
            double avg = subs.stream().mapToDouble(a -> gradeToPoint(a.getGrade())).average().orElse(0.0);
            stats.add(Map.of("subject", sub, "averageGrade", avg, "submissionCount", subs.size()));
        }
        return ResponseEntity.ok(stats);
    }

    private double gradeToPoint(String grade) {
        if (grade == null)
            return 0.0;
        switch (grade.toUpperCase()) {
            case "A":
                return 4.0;
            case "B":
                return 3.0;
            case "C":
                return 2.0;
            case "D":
                return 1.0;
            default:
                return 0.0;
        }
    }
}
