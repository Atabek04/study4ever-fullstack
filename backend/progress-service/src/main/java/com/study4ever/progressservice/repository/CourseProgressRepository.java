package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, UUID> {

    List<CourseProgress> findByUserId(String userId);

    Optional<CourseProgress> findByUserIdAndCourseId(String userId, String courseId);
    
    List<CourseProgress> findByUserIdOrderByLastAccessDateDesc(String userId);
    
    List<CourseProgress> findByCourseId(String courseId);
    
    @Query("SELECT DISTINCT c.courseId FROM CourseProgress c")
    List<String> findDistinctCourseIds();
    
    List<CourseProgress> findByCreatedDateBetween(LocalDateTime start, LocalDateTime end);
    
    List<CourseProgress> findByCourseIdAndCompletedAndCompletionDateBetween(
            String courseId, Boolean completed, LocalDateTime start, LocalDateTime end);
            
    long countByUserId(String userId);
}
