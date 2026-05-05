package com.company.travel.entity;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    private String department;
    
    private String position;
    
    private String phone;
    
    @Column(nullable = false)
    private String role;
    
    private String bankCard;
    
    private Boolean deleted = false;
    
    public enum Role {
        EMPLOYEE("普通员工"),
        DEPT_MANAGER("部门负责人"),
        FINANCE("财务人员"),
        ADMIN("系统管理员");
        
        private final String description;
        
        Role(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
