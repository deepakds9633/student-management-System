package com.example.studentmanagement.controller;

import com.example.studentmanagement.Role;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.MarkRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private com.example.studentmanagement.repository.AssignmentRepository assignmentRepository;

    @Autowired
    private com.example.studentmanagement.repository.LeaveRepository leaveRepository;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalStudents = studentRepository.count();
        long totalStaff = userRepository.countByRole(Role.STAFF);

        LocalDate today = LocalDate.now();
        // Mocking 'today' attendance for demo if database empty for today
        // In real app: countByDateAndStatus(today, "Present")
        long presentToday = attendanceRepository.countByDateBetweenAndStatus(today, today, "Present");
        long totalToday = attendanceRepository.countByDateBetween(today, today);
        long absentToday = totalToday - presentToday;

        stats.put("totalStudents", totalStudents);
        stats.put("totalStaff", totalStaff);
        stats.put("presentToday", presentToday);
        stats.put("absentToday", absentToday);
        stats.put("totalMarksEntries", markRepository.count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/marks-summary")
    public ResponseEntity<Map<String, Object>> getMarksSummary() {
        Map<String, Object> response = new HashMap<>();

        // Subject Wise
        List<Object[]> subjectResults = markRepository.findAverageMarksBySubject();
        List<Map<String, Object>> subjectStats = subjectResults.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            String subject = (String) obj[0];
            Double avg = (Double) obj[1];
            Double maxAvg = (Double) obj[2]; // Now getting max marks from DB

            map.put("subject", subject);
            map.put("average", Math.round(avg * 10.0) / 10.0);
            map.put("maxMarks", Math.round(maxAvg));

            // Calculate percentage based on actual max marks
            double max = maxAvg > 0 ? maxAvg : 100; // Safeguard against division by zero
            map.put("percentage", Math.round((avg / max) * 100));
            map.put("totalStudents", studentRepository.count()); // Approx
            return map;
        }).toList();
        response.put("subjectWiseStats", subjectStats);

        // Class Average
        double classAvg = subjectStats.stream().mapToDouble(m -> (long) m.get("percentage")).average().orElse(0);
        response.put("classAverage", Math.round(classAvg));

        // Attendance Rate (Overall)
        long totalPresent = attendanceRepository.countByStatus("Present");
        long totalRecords = attendanceRepository.count();
        double attendanceRate = totalRecords > 0 ? (double) totalPresent / totalRecords * 100 : 0;
        response.put("attendanceRate", Math.round(attendanceRate));

        // Top Performers
        List<Object[]> top = markRepository.findTopPerformers();
        response.put("topPerformers", mapPerformers(top, 5));

        // Low Performers
        List<Object[]> low = markRepository.findLowPerformers();
        response.put("lowPerformers", mapPerformers(low, 5));

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> mapPerformers(List<Object[]> data, int limit) {
        return data.stream().limit(limit).map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentName", obj[0]);
            map.put("course", obj[1]);

            // Handle Number conversion safely for SUM aggregations
            double marksObtained = obj[2] != null ? ((Number) obj[2]).doubleValue() : 0.0;
            double maxMarks = obj[3] != null ? ((Number) obj[3]).doubleValue() : 0.0;

            double max = maxMarks > 0 ? maxMarks : 100.0;
            map.put("percentage", Math.round((marksObtained / max) * 100));
            return map;
        }).toList();
    }

    @GetMapping("/attendance-trends")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceTrends(
            @RequestParam(value = "period", defaultValue = "weekly") String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = "monthly".equals(period) ? endDate.minusDays(30) : endDate.minusDays(6);

        List<Object[]> results = attendanceRepository.findDailyPresentCounts(startDate, endDate);
        long totalStudents = studentRepository.count();

        List<Map<String, Object>> response = results.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            LocalDate date = (LocalDate) obj[0];
            Long present = (Long) obj[1];

            map.put("period", date.toString()); // Or format as Day/Month
            map.put("present", present);
            map.put("total", totalStudents);
            map.put("absent", totalStudents - present);
            map.put("percentage", totalStudents > 0 ? (double) present / totalStudents * 100 : 0);
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/staff-dashboard-stats")
    public ResponseEntity<Map<String, Object>> getStaffDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalStudents = studentRepository.count();
        long assignments = assignmentRepository.count();
        long leaveRequests = leaveRepository.findByStatus("Pending").size();
        double attendanceRate = 0;

        // Calculate attendance rate
        long totalPresent = attendanceRepository.countByStatus("Present");
        long totalRecords = attendanceRepository.count();
        attendanceRate = totalRecords > 0 ? (double) totalPresent / totalRecords * 100 : 0;

        stats.put("totalStudents", totalStudents);
        stats.put("attendanceRate", Math.round(attendanceRate));
        stats.put("assignments", assignments);
        stats.put("leaveRequests", leaveRequests);

        return ResponseEntity.ok(stats);
    }
}
