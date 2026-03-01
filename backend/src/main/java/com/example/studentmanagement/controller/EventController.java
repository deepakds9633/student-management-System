package com.example.studentmanagement.controller;

import com.example.studentmanagement.Event;
import com.example.studentmanagement.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event savedEvent = eventRepository.save(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating event: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> updateEvent(@PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody Event eventDetails) {
        return eventRepository.findById(id).map(event -> {
            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setDate(eventDetails.getDate());
            event.setType(eventDetails.getType());
            Event updatedEvent = eventRepository.save(event);
            return ResponseEntity.ok(updatedEvent);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> deleteEvent(@PathVariable @org.springframework.lang.NonNull Long id) {
        return eventRepository.findById(id).map(event -> {
            eventRepository.delete(event);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
