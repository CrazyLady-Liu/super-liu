package com.company.travel.service;

import com.company.travel.entity.TravelApplication;
import com.company.travel.repository.TravelApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class TravelApplicationService {
    @Autowired
    private TravelApplicationRepository travelApplicationRepository;
    
    public TravelApplication createApplication(TravelApplication application) {
        application.setStatus("已提交");
        application.setCreatedAt(LocalDate.now());
        return travelApplicationRepository.save(application);
    }
    
    public List<TravelApplication> getApplicationsByEmployee(Long employeeId) {
        return travelApplicationRepository.findByTravelerIdsContaining(employeeId);
    }
    
    public List<TravelApplication> getAllApplications() {
        return travelApplicationRepository.findAll();
    }
    
    public TravelApplication getApplicationById(Long id) {
        return travelApplicationRepository.findById(id).orElse(null);
    }
}
