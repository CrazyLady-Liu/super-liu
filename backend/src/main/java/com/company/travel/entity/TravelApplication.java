package com.company.travel.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "travel_applications")
public class TravelApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String travelType;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Column(length = 1000)
    private String reason;
    
    @Column(nullable = false)
    private String departureCity;
    
    @Column(nullable = false)
    private String destinationCity;
    
    @ElementCollection
    private List<Long> travelerIds;
    
    @Column(nullable = false)
    private String status;
    
    @Column(nullable = false)
    private LocalDate createdAt;
}
