package com.study4ever.courseservice.event;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCompletionEvent {
    private String userId;
    private String courseId;
    private LocalDateTime timestamp;
}
