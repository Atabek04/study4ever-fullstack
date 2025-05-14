package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponseDto {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private Integer durationMinutes;
    private Integer sortOrder;
}