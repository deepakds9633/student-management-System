package com.example.studentmanagement.controller;

import com.example.studentmanagement.Role;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.User;
import com.example.studentmanagement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public Student getStudentById(@PathVariable("id") Long id) {
        return studentService.getStudentById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public Student getStudentByUserId(@PathVariable("userId") Long userId) {
        return studentService.getStudentByUserId(userId).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public Student createStudent(@RequestBody Student student) {
        // Create User for Student if authentication details are provided in a DTO,
        // but since we are receiving Student entity directly, we might need a DTO or
        // assume User is null and generated.
        // For this prototype, let's assume we generate a default user for the student
        // based on email/name if not provided.
        // Actually best approach: use a DTO that contains user creds + student details.
        // For simplicity: We will auto-generate a User with username=email and
        // password="password".

        if (student.getUser() == null) {
            User user = new User();
            user.setUsername(student.getEmail());
            user.setPassword(encoder.encode("password")); // Default password
            user.setRole(Role.STUDENT);
            student.setUser(user);
        }

        return studentService.saveStudent(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public Student updateStudent(@PathVariable("id") Long id, @RequestBody Student studentDetails) {
        return studentService.updateStudent(id, studentDetails);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public void deleteStudent(@PathVariable("id") Long id) {
        studentService.deleteStudent(id);
    }
}
