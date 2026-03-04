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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/export")
public class ExportController {
    private static final Logger logger = LoggerFactory.getLogger(ExportController.class);

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
        logger.info("Exporting {} students to CSV", students.size());
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
        logger.info("Exporting {} marks for student ID {} to CSV", marks.size(), studentId);
        StringBuilder sb = new StringBuilder();
        sb.append("Subject,Exam Type,Obtained,Max Marks,Percentage\n");
        for (Mark m : marks) {
            Integer obtained = m.getMarksObtained();
            double pct = (obtained != null && m.getMaxMarks() > 0) ? (obtained * 100.0 / m.getMaxMarks()) : 0;
            String obtainedStr = obtained != null ? String.valueOf(obtained) : "AB";
            sb.append(String.format("\"%s\",\"%s\",%s,%d,%.1f%%\n",
                    m.getSubject(), m.getExamType(), obtainedStr, m.getMaxMarks(), pct));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_" + studentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    @GetMapping("/marks/csv")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<byte[]> exportAllMarksCsv() {
        List<Mark> marks = markRepository.findAll();
        logger.info("Exporting {} total marks to CSV", marks.size());
        StringBuilder sb = new StringBuilder();
        sb.append("Student ID,Student Name,Subject,Exam Type,Obtained,Max Marks,Percentage\n");
        for (Mark m : marks) {
            Integer obtained = m.getMarksObtained();
            double pct = (obtained != null && m.getMaxMarks() > 0) ? (obtained * 100.0 / m.getMaxMarks()) : 0;
            String studentName = m.getStudent() != null && m.getStudent().getName() != null ? m.getStudent().getName()
                    : "No Name";
            Long sId = m.getStudent() != null ? m.getStudent().getId() : 0L;
            String obtainedStr = obtained != null ? String.valueOf(obtained) : "AB";
            sb.append(String.format("%d,\"%s\",\"%s\",\"%s\",%s,%d,%.1f%%\n",
                    sId, studentName, m.getSubject(), m.getExamType(), obtainedStr, m.getMaxMarks(), pct));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all_marks_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    @GetMapping("/attendance/csv/{studentId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('STUDENT')")
    public ResponseEntity<byte[]> exportAttendanceCsv(@PathVariable("studentId") Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        logger.info("Exporting {} attendance records for student ID {} to CSV", records.size(), studentId);
        StringBuilder sb = new StringBuilder();
        sb.append("#,Date,Status\n");
        int i = 1;
        for (Attendance a : records) {
            String dateStr = a.getDate() != null ? a.getDate().toString() : "N/A";
            sb.append(String.format("%d,%s,%s\n", i++, dateStr, a.getStatus()));
        }

        long present = records.stream().filter(a -> "Present".equals(a.getStatus())).count();
        double pct = records.size() > 0 ? (present * 100.0 / records.size()) : 0;
        sb.append(String.format("\nSummary:,Present: %d/%d,%.1f%%\n", present, records.size(), pct));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_" + studentId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    @GetMapping("/attendance/csv")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<byte[]> exportAllAttendanceCsv() {
        List<Attendance> records = attendanceRepository.findAll();
        logger.info("Exporting {} total attendance records to CSV", records.size());
        StringBuilder sb = new StringBuilder();
        sb.append("Student ID,Student Name,Date,Status\n");
        for (Attendance a : records) {
            String studentName = a.getStudent() != null && a.getStudent().getName() != null ? a.getStudent().getName()
                    : "No Name";
            Long sId = a.getStudent() != null ? a.getStudent().getId() : 0L;
            String dateStr = a.getDate() != null ? a.getDate().toString() : "N/A";
            sb.append(String.format("%d,\"%s\",%s,%s\n", sId, studentName, dateStr, a.getStatus()));
        }

        long present = records.stream().filter(a -> "Present".equals(a.getStatus())).count();
        double pct = records.size() > 0 ? (present * 100.0 / records.size()) : 0;
        sb.append(String.format("\nSummary:,Present: %d/%d,%.1f%%\n", present, records.size(), pct));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all_attendance_report.csv")
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
