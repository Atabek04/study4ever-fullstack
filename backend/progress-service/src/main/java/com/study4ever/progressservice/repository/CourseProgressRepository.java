package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, UUID> {

    List<CourseProgress> findByUserId(String userId);

    Optional<CourseProgress> findByUserIdAndCourseId(String userId, String courseId);
}
