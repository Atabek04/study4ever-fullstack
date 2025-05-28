package com.study4ever.progressservice.service;

import com.study4ever.progressservice.model.LessonProgress;

/**
 * Service for handling transactional operations related to lesson progress
 */
public interface LessonProgressTransactionalService {

    /**
     * Gets a unique lesson progress entry, handling duplicates appropriately.
     * If duplicates exist, keeps the oldest one and removes others.
     */
    LessonProgress getOrCleanupLessonProgress(String userId,
                                             String courseId,
                                             String moduleId,
                                             String lessonId,
                                             boolean throwIfNotFound);
}
