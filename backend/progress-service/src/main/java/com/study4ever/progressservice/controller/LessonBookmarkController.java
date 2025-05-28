package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonBookmarkDto;
import com.study4ever.progressservice.service.LessonBookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class LessonBookmarkController {

    private final LessonBookmarkService bookmarkService;

    @PostMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/bookmark")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonBookmarkDto addBookmark(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        log.debug("Adding bookmark for user {} to lesson {} in course {}", userId, lessonId, courseId);
        return bookmarkService.addBookmark(userId, courseId, moduleId, lessonId);
    }

    @DeleteMapping("/lessons/{lessonId}/bookmark")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBookmark(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String lessonId) {
        log.debug("Removing bookmark for user {} from lesson {}", userId, lessonId);
        bookmarkService.removeBookmark(userId, lessonId);
    }

    @GetMapping("/lessons/{lessonId}/bookmark/status")
    public boolean isBookmarked(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String lessonId) {
        log.debug("Checking bookmark status for user {} and lesson {}", userId, lessonId);
        return bookmarkService.isBookmarked(userId, lessonId);
    }

    @GetMapping("/bookmarks")
    public List<LessonBookmarkDto> getUserBookmarks(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting all bookmarks for user {}", userId);
        return bookmarkService.getUserBookmarks(userId);
    }

    @GetMapping("/courses/{courseId}/bookmarks")
    public List<LessonBookmarkDto> getUserBookmarksByCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting bookmarks for user {} in course {}", userId, courseId);
        return bookmarkService.getUserBookmarksByCourse(userId, courseId);
    }

    @GetMapping("/bookmarks/count")
    public long getUserBookmarkCount(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting bookmark count for user {}", userId);
        return bookmarkService.getUserBookmarkCount(userId);
    }

    @DeleteMapping("/courses/{courseId}/bookmarks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAllUserBookmarks(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Removing all bookmarks for user {} in course {}", userId, courseId);
        bookmarkService.removeAllUserBookmarks(userId, courseId);
    }
}
