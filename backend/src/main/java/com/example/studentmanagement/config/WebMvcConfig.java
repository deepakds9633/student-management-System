package com.example.studentmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@org.springframework.lang.NonNull ResourceHandlerRegistry registry) {
        String uploadDir = System.getProperty("user.home") + File.separator + "student-mgmt-uploads" + File.separator;

        // Map /api/files/** to the external upload directory
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:" + uploadDir);

        // Map announcement uploads
        registry.addResourceHandler("/api/files/announcements/**")
                .addResourceLocations("file:" + uploadDir + "announcements" + File.separator);
    }
}
