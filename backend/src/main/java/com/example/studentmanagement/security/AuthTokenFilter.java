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
            String uri = request.getRequestURI();
            System.out.println("DEBUG: Filter processing URI: " + uri);
            String jwt = parseJwt(request);

            if (jwt != null) {
                System.out.println("DEBUG: JWT found: " + (jwt.length() > 20 ? jwt.substring(0, 20) + "..." : jwt));
                boolean valid = jwtUtils.validateJwtToken(jwt);
                System.out.println("DEBUG: JWT valid? " + valid);

                if (valid) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    System.out.println("DEBUG: JWT Username: " + username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    System.out.println("DEBUG: UserDetails loaded for: " + username + " with authorities: "
                            + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    System.out.println("DEBUG: SecurityContext successfully updated for user: " + username);
                } else {
                    System.out.println("DEBUG: JWT validation failed.");
                }
            } else {
                System.out.println("DEBUG: No JWT found in Authorization header or 'token' parameter. URI: " + uri);
                System.out.println("DEBUG: Auth Header: " + request.getHeader("Authorization"));
                System.out.println("DEBUG: All Params: " + request.getParameterMap().keySet());
            }
        } catch (Exception e) {
            System.out.println("DEBUG: ERROR in AuthTokenFilter: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        // Check for token in common query parameters
        String tokenParam = request.getParameter("token");
        if (!StringUtils.hasText(tokenParam)) {
            tokenParam = request.getParameter("authorization");
        }

        if (StringUtils.hasText(tokenParam)) {
            tokenParam = tokenParam.trim();
            if (tokenParam.startsWith("Bearer ")) {
                return tokenParam.substring(7);
            }
            return tokenParam;
        }

        return null;
    }
}
