package com.example.studentmanagement.service;

import com.example.studentmanagement.Staff;
import com.example.studentmanagement.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Optional<Staff> getStaffById(@org.springframework.lang.NonNull Long id) {
        return staffRepository.findById(id);
    }

    public Staff saveStaff(@org.springframework.lang.NonNull Staff staff) {
        return staffRepository.save(staff);
    }

    public void deleteStaff(@org.springframework.lang.NonNull Long id) {
        staffRepository.deleteById(id);
    }

    public Optional<Staff> getStaffByUserId(Long userId) {
        return staffRepository.findByUserId(userId);
    }
}
