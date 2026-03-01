package com.example.studentmanagement.controller;

import com.example.studentmanagement.User;
import com.example.studentmanagement.payload.JwtResponse;
import com.example.studentmanagement.payload.LoginRequest;
import com.example.studentmanagement.payload.MessageResponse;
import com.example.studentmanagement.payload.SignupRequest;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                User user = userRepository.findByUsername(userDetails.getUsername()).get();
                return ResponseEntity.ok(new JwtResponse(jwt,
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                roles));
        }

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
                if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Username is already taken!"));
                }

                // Create new user's account
                User user = new User();
                user.setUsername(signUpRequest.getUsername());
                user.setPassword(encoder.encode(signUpRequest.getPassword()));
                user.setRole(signUpRequest.getRole());

                userRepository.save(user);

                return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        }
}
