package com.study4ever.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long totalStudents;
    private Long totalInstructors;
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
}
