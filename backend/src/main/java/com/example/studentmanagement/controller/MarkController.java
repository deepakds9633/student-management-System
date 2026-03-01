package com.example.studentmanagement.controller;

import com.example.studentmanagement.Mark;
import com.example.studentmanagement.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.Student;
import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/marks")
public class MarkController {

    @Autowired
    private MarkService markService;

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
    public Mark addMark(@RequestBody Mark mark) {
        return markService.addMark(mark);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('STUDENT')")
    public List<Mark> getMarksByStudent(@PathVariable("studentId") String studentId, Principal principal) {
        boolean hasPrivilege = userRepository.findByUsername(principal.getName())
                .map(u -> {
                    String roleName = u.getRole().name();
                    return roleName.equals("ADMIN") || roleName.equals("STAFF");
                }).orElse(false);

        if (!hasPrivilege || studentId.equals("me")) {
            Student student = getStudentFromPrincipal(principal);
            if (student == null)
                return List.of();
            return markService.getMarksByStudent(student.getId());
        }

        try {
            return markService.getMarksByStudent(Long.valueOf(studentId));
        } catch (NumberFormatException e) {
            return List.of();
        }
    }

    @GetMapping("/student/{studentId}/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('STUDENT')")
    public List<Mark> getMarksByStudentAndType(@PathVariable("studentId") String studentId,
            @PathVariable("type") String type, Principal principal) {
        boolean hasPrivilege = userRepository.findByUsername(principal.getName())
                .map(u -> {
                    String roleName = u.getRole().name();
                    return roleName.equals("ADMIN") || roleName.equals("STAFF");
                }).orElse(false);

        if (!hasPrivilege || studentId.equals("me")) {
            Student student = getStudentFromPrincipal(principal);
            if (student == null)
                return List.of();
            return markService.getMarksByStudentAndType(student.getId(), type);
        }

        try {
            return markService.getMarksByStudentAndType(Long.valueOf(studentId), type);
        } catch (NumberFormatException e) {
            return List.of();
        }
    }
}
