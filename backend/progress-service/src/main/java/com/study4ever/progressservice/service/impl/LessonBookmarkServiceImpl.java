package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.LessonBookmarkDto;
import com.study4ever.progressservice.model.LessonBookmark;
import com.study4ever.progressservice.repository.LessonBookmarkRepository;
import com.study4ever.progressservice.service.LessonBookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LessonBookmarkServiceImpl implements LessonBookmarkService {

    private final LessonBookmarkRepository bookmarkRepository;

    @Override
    public LessonBookmarkDto addBookmark(String userId, String courseId, String moduleId, String lessonId) {
        log.debug("Adding bookmark for user {} to lesson {} in course {}", userId, lessonId, courseId);

        if (bookmarkRepository.existsByUserIdAndLessonId(userId, lessonId)) {
            log.debug("Bookmark already exists for user {} and lesson {}", userId, lessonId);
            LessonBookmark existingBookmark = bookmarkRepository.findByUserIdAndLessonId(userId, lessonId)
                    .orElseThrow(() -> new IllegalStateException("Bookmark should exist but was not found"));
            return mapToDto(existingBookmark);
        }

        try {
            LessonBookmark bookmark = LessonBookmark.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .lessonId(lessonId)
                    .build();

            LessonBookmark savedBookmark = bookmarkRepository.save(bookmark);
            log.info("Successfully created bookmark for user {} and lesson {}", userId, lessonId);
            return mapToDto(savedBookmark);

        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate bookmark attempt for user {} and lesson {}", userId, lessonId);
            LessonBookmark existingBookmark = bookmarkRepository.findByUserIdAndLessonId(userId, lessonId)
                    .orElseThrow(() -> new IllegalStateException("Bookmark should exist but was not found"));
            return mapToDto(existingBookmark);
        }
    }

    @Override
    public void removeBookmark(String userId, String lessonId) {
        log.debug("Removing bookmark for user {} from lesson {}", userId, lessonId);

        if (!bookmarkRepository.existsByUserIdAndLessonId(userId, lessonId)) {
            log.debug("No bookmark found for user {} and lesson {}", userId, lessonId);
            return;
        }

        bookmarkRepository.deleteByUserIdAndLessonId(userId, lessonId);
        log.info("Successfully removed bookmark for user {} and lesson {}", userId, lessonId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonBookmarkDto> getUserBookmarks(String userId) {
        log.debug("Getting all bookmarks for user {}", userId);
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonBookmarkDto> getUserBookmarksByCourse(String userId, String courseId) {
        log.debug("Getting bookmarks for user {} in course {}", userId, courseId);
        return bookmarkRepository.findByUserIdAndCourseIdOrderByCreatedAtDesc(userId, courseId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBookmarked(String userId, String lessonId) {
        return bookmarkRepository.existsByUserIdAndLessonId(userId, lessonId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUserBookmarkCount(String userId) {
        return bookmarkRepository.countByUserId(userId);
    }

    @Override
    public void removeAllUserBookmarks(String userId, String courseId) {
        log.debug("Removing all bookmarks for user {} in course {}", userId, courseId);
        bookmarkRepository.deleteByUserIdAndCourseId(userId, courseId);
        log.info("Successfully removed all bookmarks for user {} in course {}", userId, courseId);
    }

    private LessonBookmarkDto mapToDto(LessonBookmark bookmark) {
        return LessonBookmarkDto.builder()
                .id(bookmark.getId())
                .userId(bookmark.getUserId())
                .courseId(bookmark.getCourseId())
                .moduleId(bookmark.getModuleId())
                .lessonId(bookmark.getLessonId())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
