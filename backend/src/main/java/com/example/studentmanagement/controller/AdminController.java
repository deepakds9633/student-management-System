package com.example.studentmanagement.controller;

import com.example.studentmanagement.User;
import com.example.studentmanagement.Role;
import com.example.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("role", u.getRole().name());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Update user role
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found with id: " + id));
            }

            User user = userOpt.get();
            String newRole = body.get("role");
            if (newRole == null || newRole.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }

            user.setRole(Role.valueOf(newRole.toUpperCase()));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Role updated to " + newRole, "id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid role: " + body.get("role") + ". Valid roles: STUDENT, STAFF, ADMIN"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update role: " + e.getMessage()));
        }
    }

    // Update user details (username + password + role)
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            if (body.containsKey("username") && body.get("username") != null && !body.get("username").isEmpty()) {
                // Check if new username is already taken by another user
                Optional<User> existing = userRepository.findByUsername(body.get("username"));
                if (existing.isPresent() && !existing.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
                }
                user.setUsername(body.get("username"));
            }

            if (body.containsKey("password") && body.get("password") != null && !body.get("password").isEmpty()) {
                user.setPassword(passwordEncoder.encode(body.get("password")));
            }

            if (body.containsKey("role") && body.get("role") != null && !body.get("role").isEmpty()) {
                user.setRole(Role.valueOf(body.get("role").toUpperCase()));
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User updated successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Update failed: " + e.getMessage()));
        }
    }

    // Delete user (handles foreign key constraints)
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            if (errorMsg != null && (errorMsg.contains("foreign key") || errorMsg.contains("constraint")
                    || errorMsg.contains("ConstraintViolation"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Cannot delete this user because they have linked student/staff records. Remove those records first, or change the user's role instead."));
            }
            return ResponseEntity.internalServerError().body(Map.of("message", "Delete failed: " + errorMsg));
        }
    }

    // Create user (admin can create any role)
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role = body.get("role");

        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }

        try {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.valueOf(role != null ? role.toUpperCase() : "STUDENT"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User created successfully", "id", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Create failed: " + e.getMessage()));
        }
    }

    // Dashboard stats
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<User> users = userRepository.findAll();
        long students = users.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long staff = users.stream().filter(u -> u.getRole() == Role.STAFF).count();
        long admins = users.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("students", students);
        stats.put("staff", staff);
        stats.put("admins", admins);
        return ResponseEntity.ok(stats);
    }
}
