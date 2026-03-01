package com.example.studentmanagement.service;

import com.example.studentmanagement.Mark;
import com.example.studentmanagement.repository.MarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    public Mark addMark(@org.springframework.lang.NonNull Mark mark) {
        return markRepository.save(mark);
    }

    public List<Mark> getMarksByStudent(Long studentId) {
        return markRepository.findByStudentId(studentId);
    }

    public List<Mark> getMarksByStudentAndType(Long studentId, String examType) {
        return markRepository.findByStudentIdAndExamType(studentId, examType);
    }
}
