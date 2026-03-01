package com.example.studentmanagement.controller;

import com.example.studentmanagement.User;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.security.JwtUtils;
import com.example.studentmanagement.payload.JwtResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            String newUsername = body.get("username");
            String newEmail = body.get("email");

            if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.equals(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
                }
                user.setUsername(newUsername);
            }

            if (newEmail != null && !newEmail.trim().isEmpty()) {
                user.setEmail(newEmail);
            }

            userRepository.save(user);

            // Generate new JWT token with updated username
            String newJwt = jwtUtils.generateTokenFromUsername(user.getUsername());

            // Return updated JWT response
            return ResponseEntity.ok(new JwtResponse(
                    newJwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    java.util.List.of("ROLE_" + user.getRole().name())));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            // Validate file size (< 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds 5MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png")
                    || contentType.equals("image/gif"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid file type. Only JPG, PNG, and GIF are allowed."));
            }

            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.setProfileImage(file.getBytes());
            user.setProfileImageType(contentType);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile avatar updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload avatar: " + e.getMessage()));
        }
    }

    @GetMapping("/avatar")
    public ResponseEntity<byte[]> getAvatar(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getProfileImage() != null && user.getProfileImageType() != null) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, user.getProfileImageType())
                        .body(user.getProfileImage());
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/avatar/{username}")
    public ResponseEntity<byte[]> getAvatarByUsername(@PathVariable("username") String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getProfileImage() != null && user.getProfileImageType() != null) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, user.getProfileImageType())
                        .body(user.getProfileImage());
            }
        }
        return ResponseEntity.notFound().build();
    }
}
