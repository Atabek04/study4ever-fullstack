package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    
    private String userId;
    private String username;
    private Long totalStudyMinutes;
    private Integer sessionCount;
    private Integer rank;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // Computed fields for display
    private String formattedDuration;
    private Boolean isCurrentUser;
    private String profileImageUrl;
    
    public String getFormattedDuration() {
        if (totalStudyMinutes == null) {
            return "0h 0m";
        }
        
        long hours = totalStudyMinutes / 60;
        long minutes = totalStudyMinutes % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }
}
