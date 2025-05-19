package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.ModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, UUID> {

    List<ModuleProgress> findByUserIdAndCourseId(String userId, String courseId);

    Optional<ModuleProgress> findByUserIdAndCourseIdAndModuleId(String userId, String courseId, String moduleId);

    @Modifying
    @Query("DELETE FROM ModuleProgress m WHERE m.userId = ?1 AND m.courseId = ?2")
    void deleteByUserIdAndCourseId(String userId, String courseId);
}
