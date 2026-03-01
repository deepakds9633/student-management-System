package com.example.studentmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    public AuthTokenFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        System.out.println("DEBUG: AuthTokenFilter bean initialized with dependencies!");
    }

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            System.out.println("DEBUG: Filter processing URI: " + request.getRequestURI());
            String jwt = parseJwt(request);
            if (jwt != null) {
                boolean valid = jwtUtils.validateJwtToken(jwt);
                logger.error("DEBUG: JWT present. Valid? {}", valid);
                if (valid) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    System.out.println("DEBUG: JWT Username: " + username);
                    System.out.println("DEBUG: userDetailsService is " + userDetailsService);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    logger.error("DEBUG: UserDetails loaded. Authorities: {}", userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    logger.error("DEBUG: Auth set in SecurityContext for user: {}", authentication.getName());
                }
            } else {
                logger.error("DEBUG: No JWT found in request. Auth Header: {}", request.getHeader("Authorization"));
            }
        } catch (Exception e) {
            System.out.println("Cannot set user authentication: " + e);
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
