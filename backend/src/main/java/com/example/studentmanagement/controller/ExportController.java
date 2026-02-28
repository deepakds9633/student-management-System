package com.example.studentmanagement.controller;

import com.example.studentmanagement.Attendance;
import com.example.studentmanagement.Mark;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.MarkRepository;
import com.example.studentmanagement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping("/students/csv")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<byte[]> exportStudentsCsv() {
        List<Student> students = studentService.getAllStudents();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Name,Email,Course,Year,Semester\n");
        for (Student s : students) {
            sb.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    s.getId(),
                    s.getName() != null ? s.getName() : "",
                    s.getEmail() != null ? s.getEmail() : "",
                    s.getCourse() != null ? s.getCourse() : "",
                    s.getYear() != null ? s.getYear() : "",
                    s.getSemester() != null ? s.getSemester() : ""));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    @GetMapping("/marks/csv/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public ResponseEntity<byte[]> exportMarksCsv(@PathVariable("studentId") Long studentId) {
        List<Mark> marks = markRepository.findByStudentId(studentId);
        StringBuilder sb = new StringBuilder();
        sb.append("Subject,Exam Type,Obtained,Max Marks,Percentage\n");
        for (Mark m : marks) {
            double pct = m.getMaxMarks() > 0 ? (m.getMarksObtained() * 100.0 / m.getMaxMarks()) : 0;
            sb.append(String.format("\"%s\",\"%s\",%d,%d,%.1f%%\n",
                    m.getSubject(), m.getExamType(), m.getMarksObtained(), m.getMaxMarks(), pct));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_" + studentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    @GetMapping("/attendance/csv/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public ResponseEntity<byte[]> exportAttendanceCsv(@PathVariable("studentId") Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        StringBuilder sb = new StringBuilder();
        sb.append("#,Date,Status\n");
        int i = 1;
        for (Attendance a : records) {
            sb.append(String.format("%d,%s,%s\n", i++, a.getDate().toString(), a.getStatus()));
        }

        long present = records.stream().filter(a -> "Present".equals(a.getStatus())).count();
        double pct = records.size() > 0 ? (present * 100.0 / records.size()) : 0;
        sb.append(String.format("\nSummary:,Present: %d/%d,%.1f%%\n", present, records.size(), pct));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_" + studentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    // JSON export endpoints for frontend table rendering
    @GetMapping("/students/json")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Student>> exportStudentsJson() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/marks/json/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public ResponseEntity<List<Mark>> exportMarksJson(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(markRepository.findByStudentId(studentId));
    }

    @GetMapping("/attendance/json/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public ResponseEntity<List<Attendance>> exportAttendanceJson(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(attendanceRepository.findByStudentId(studentId));
    }
}
