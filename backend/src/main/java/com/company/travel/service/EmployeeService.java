package com.company.travel.service;

import com.company.travel.entity.Employee;
import com.company.travel.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @PostConstruct
    public void init() {
        if (employeeRepository.count() == 0) {
            Employee emp1 = new Employee();
            emp1.setUsername("admin");
            emp1.setPassword(passwordEncoder.encode("123456"));
            emp1.setName("管理员");
            emp1.setDepartment("行政部");
            employeeRepository.save(emp1);
            
            Employee emp2 = new Employee();
            emp2.setUsername("zhangsan");
            emp2.setPassword(passwordEncoder.encode("123456"));
            emp2.setName("张三");
            emp2.setDepartment("技术部");
            employeeRepository.save(emp2);
            
            Employee emp3 = new Employee();
            emp3.setUsername("lisi");
            emp3.setPassword(passwordEncoder.encode("123456"));
            emp3.setName("李四");
            emp3.setDepartment("市场部");
            employeeRepository.save(emp3);
            
            Employee emp4 = new Employee();
            emp4.setUsername("wangwu");
            emp4.setPassword(passwordEncoder.encode("123456"));
            emp4.setName("王五");
            emp4.setDepartment("财务部");
            employeeRepository.save(emp4);
        }
    }
    
    public Optional<Employee> findByUsername(String username) {
        return employeeRepository.findByUsername(username);
    }
    
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }
    
    public Optional<Employee> findById(Long id) {
        return employeeRepository.findById(id);
    }
}
