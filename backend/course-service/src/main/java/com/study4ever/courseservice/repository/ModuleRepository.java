package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    @Query("SELECT MAX(m.sortOrder) FROM Module m WHERE m.course.id = :courseId")
    Optional<Integer> findMaxSortOrderByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Module m WHERE m.course.id = :courseId AND m.sortOrder = :sortOrder AND m.id <> :moduleId")
    boolean existsByCourseIdAndSortOrderAndIdNot(@Param("courseId") Long courseId, @Param("sortOrder") Integer sortOrder, @Param("moduleId") Long moduleId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Module m WHERE m.course.id = :courseId AND m.sortOrder = :sortOrder")
    boolean existsByCourseIdAndSortOrder(@Param("courseId") Long courseId, @Param("sortOrder") Integer sortOrder);
}