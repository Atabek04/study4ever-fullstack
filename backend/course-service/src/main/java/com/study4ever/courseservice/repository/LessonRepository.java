package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query("SELECT MAX(l.sortOrder) FROM Lesson l WHERE l.module.id = :moduleId")
    Optional<Integer> findMaxSortOrderByModuleId(@Param("moduleId") Long moduleId);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Lesson l WHERE l.module.id = :moduleId AND l.sortOrder = :sortOrder AND l.id <> :lessonId")
    boolean existsByModuleIdAndSortOrderAndIdNot(@Param("moduleId") Long moduleId, @Param("sortOrder") Integer sortOrder, @Param("lessonId") Long lessonId);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Lesson l WHERE l.module.id = :moduleId AND l.sortOrder = :sortOrder")
    boolean existsByModuleIdAndSortOrder(@Param("moduleId") Long moduleId, @Param("sortOrder") Integer sortOrder);
    
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND l.id = :lessonId")
    Optional<Lesson> findByModuleIdAndId(@Param("moduleId") Long moduleId, @Param("lessonId") Long lessonId);
}