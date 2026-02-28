package com.example.studentmanagement.controller;

import com.example.studentmanagement.Mark;
import com.example.studentmanagement.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/marks")
public class MarkController {

    @Autowired
    private MarkService markService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public Mark addMark(@RequestBody Mark mark) {
        return markService.addMark(mark);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public List<Mark> getMarksByStudent(@PathVariable("studentId") Long studentId) {
        return markService.getMarksByStudent(studentId);
    }

    @GetMapping("/student/{studentId}/type/{type}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public List<Mark> getMarksByStudentAndType(@PathVariable("studentId") Long studentId,
            @PathVariable("type") String type) {
        return markService.getMarksByStudentAndType(studentId, type);
    }
}
