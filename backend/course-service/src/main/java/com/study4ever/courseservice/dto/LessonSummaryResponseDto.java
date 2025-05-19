package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonSummaryResponseDto {
    private Long id;
    private String title;
    private Integer durationMinutes;
    private Integer sortOrder;
}
