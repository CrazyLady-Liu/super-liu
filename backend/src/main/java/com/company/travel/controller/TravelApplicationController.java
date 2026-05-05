package com.company.travel.controller;

import com.company.travel.entity.TravelApplication;
import com.company.travel.service.TravelApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/travel-applications")
@CrossOrigin(origins = "http://localhost:3000")
public class TravelApplicationController {
    @Autowired
    private TravelApplicationService travelApplicationService;
    
    @PostMapping
    public ResponseEntity<TravelApplication> createApplication(@RequestBody TravelApplication application) {
        TravelApplication saved = travelApplicationService.createApplication(application);
        return ResponseEntity.ok(saved);
    }
    
    @GetMapping
    public ResponseEntity<List<TravelApplication>> getAllApplications() {
        return ResponseEntity.ok(travelApplicationService.getAllApplications());
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TravelApplication>> getApplicationsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(travelApplicationService.getApplicationsByEmployee(employeeId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TravelApplication> getApplicationById(@PathVariable Long id) {
        TravelApplication application = travelApplicationService.getApplicationById(id);
        return application != null ? ResponseEntity.ok(application) : ResponseEntity.notFound().build();
    }
}
