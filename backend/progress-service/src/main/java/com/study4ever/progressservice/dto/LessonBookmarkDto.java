package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonBookmarkDto {
    private UUID id;
    private String userId;
    private String courseId;
    private String moduleId;
    private String lessonId;
    private LocalDateTime createdAt;
}
