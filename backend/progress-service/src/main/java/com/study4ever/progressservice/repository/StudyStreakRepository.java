package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.StudyStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudyStreakRepository extends JpaRepository<StudyStreak, String> {
    List<StudyStreak> findByLastStudyDateBefore(LocalDate date);
}
