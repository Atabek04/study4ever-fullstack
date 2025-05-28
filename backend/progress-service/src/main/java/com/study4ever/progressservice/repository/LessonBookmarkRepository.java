package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.LessonBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonBookmarkRepository extends JpaRepository<LessonBookmark, UUID> {

    List<LessonBookmark> findByUserIdOrderByCreatedAtDesc(String userId);

    List<LessonBookmark> findByUserIdAndCourseIdOrderByCreatedAtDesc(String userId, String courseId);

    Optional<LessonBookmark> findByUserIdAndLessonId(String userId, String lessonId);

    boolean existsByUserIdAndLessonId(String userId, String lessonId);

    void deleteByUserIdAndLessonId(String userId, String lessonId);

    void deleteByUserIdAndCourseId(String userId, String courseId);

    long countByUserId(String userId);
}
