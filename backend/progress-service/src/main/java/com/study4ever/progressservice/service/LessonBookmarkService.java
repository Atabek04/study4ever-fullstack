package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.LessonBookmarkDto;

import java.util.List;

public interface LessonBookmarkService {

    LessonBookmarkDto addBookmark(String userId, String courseId, String moduleId, String lessonId);

    void removeBookmark(String userId, String lessonId);

    List<LessonBookmarkDto> getUserBookmarks(String userId);

    List<LessonBookmarkDto> getUserBookmarksByCourse(String userId, String courseId);

    boolean isBookmarked(String userId, String lessonId);

    long getUserBookmarkCount(String userId);

    void removeAllUserBookmarks(String userId, String courseId);
}
