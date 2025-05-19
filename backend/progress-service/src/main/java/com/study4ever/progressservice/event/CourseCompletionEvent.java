package com.study4ever.progressservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCompletionEvent {
    private String userId;
    private String courseId;
    private LocalDateTime timestamp;
}
