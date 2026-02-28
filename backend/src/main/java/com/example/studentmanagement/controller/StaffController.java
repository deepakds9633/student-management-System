package com.example.studentmanagement.controller;

import com.example.studentmanagement.Role;
import com.example.studentmanagement.Staff;
import com.example.studentmanagement.User;
import com.example.studentmanagement.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('STAFF')")
    public Staff getStaffByUserId(@PathVariable("userId") Long userId) {
        return staffService.getStaffByUserId(userId).orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')") // Maybe only ADMIN? But we only have STAFF/STUDENT. So STAFF can add other
                                      // STAFF?
    public Staff createStaff(@RequestBody Staff staff) {
        if (staff.getUser() == null) {
            User user = new User();
            user.setUsername(staff.getEmail());
            user.setPassword(encoder.encode("password"));
            user.setRole(Role.STAFF);
            staff.setUser(user);
        }
        return staffService.saveStaff(staff);
    }
}
