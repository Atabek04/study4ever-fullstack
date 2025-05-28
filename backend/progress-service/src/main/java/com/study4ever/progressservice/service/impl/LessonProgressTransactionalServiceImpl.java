package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.LessonProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.service.LessonProgressTransactionalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressTransactionalServiceImpl implements LessonProgressTransactionalService {

    private final LessonProgressRepository lessonProgressRepository;

    /**
     * Gets a unique lesson progress entry, handling duplicates appropriately.
     * If duplicates exist, keeps the oldest one and removes others.
     */
    @Override
    @Transactional
    public LessonProgress getOrCleanupLessonProgress(String userId,
                                                     String courseId,
                                                     String moduleId,
                                                     String lessonId,
                                                     boolean throwIfNotFound) {
        List<LessonProgress> progressEntries = lessonProgressRepository.findByUserIdAndCourseIdAndModuleIdAndLessonId(
                userId, courseId, moduleId, lessonId);

        if (progressEntries.isEmpty() && throwIfNotFound) {
            throw new NotFoundException("Lesson progress not found for user " + userId + " and lesson " + lessonId);
        } else if (progressEntries.isEmpty()) {
            return null;
        }

        if (progressEntries.size() == 1) {
            return progressEntries.get(0);
        }

        log.warn("Found {} duplicate lesson progress entries for user={}, course={}, module={}, lesson={}. " +
                "Cleaning up duplicates.", progressEntries.size(), userId, courseId, moduleId, lessonId);

        progressEntries.sort(Comparator.comparing(LessonProgress::getFirstAccessDate));
        LessonProgress primaryRecord = progressEntries.get(0);

        for (int i = 1; i < progressEntries.size(); i++) {
            LessonProgress duplicate = progressEntries.get(i);

            if (duplicate.getStatus() == ProgressStatus.COMPLETED &&
                    primaryRecord.getStatus() != ProgressStatus.COMPLETED) {
                primaryRecord.setStatus(ProgressStatus.COMPLETED);
                primaryRecord.setCompletionDate(duplicate.getCompletionDate());
            }

            if (duplicate.getLastAccessDate().isAfter(primaryRecord.getLastAccessDate())) {
                primaryRecord.setLastAccessDate(duplicate.getLastAccessDate());
            }

            lessonProgressRepository.delete(duplicate);
        }

        return lessonProgressRepository.save(primaryRecord);
    }
}
