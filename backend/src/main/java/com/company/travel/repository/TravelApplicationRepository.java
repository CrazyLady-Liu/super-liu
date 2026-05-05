package com.company.travel.repository;

import com.company.travel.entity.TravelApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelApplicationRepository extends JpaRepository<TravelApplication, Long> {
    List<TravelApplication> findByTravelerIdsContaining(Long employeeId);
}
