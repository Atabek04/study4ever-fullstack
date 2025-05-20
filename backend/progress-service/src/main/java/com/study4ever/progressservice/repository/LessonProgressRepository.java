package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    List<LessonProgress> findByUserIdAndCourseId(String userId, String courseId);

    List<LessonProgress> findByUserIdAndCourseIdAndModuleId(String userId, String courseId, String moduleId);

    Optional<LessonProgress> findByUserIdAndCourseIdAndModuleIdAndLessonId(
            String userId, String courseId, String moduleId, String lessonId);

    void deleteByUserIdAndCourseId(String userId, String courseId);
}
