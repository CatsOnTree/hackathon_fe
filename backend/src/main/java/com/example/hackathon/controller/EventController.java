package com.example.hackathon.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(List.of(Map.of(
                "id", 1,
                "name", "AI Hiring Drive 2026",
                "status", "OPEN"
        )));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        body.put("id", 42);
        return ResponseEntity.status(201).body(body);
    }
}
