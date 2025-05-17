package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseProgressController {

    @GetMapping("/{courseId}/progress")
    public CourseProgressDto getCourseProgress(@PathVariable String courseId) {
        // Implementation will be added later
        return null;
    }

    @PostMapping("/{courseId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public CourseProgressDto initializeCourseProgress(@PathVariable String courseId) {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/progress")
    public List<CourseProgressDto> getAllCoursesProgress() {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/{courseId}/modules/progress")
    public List<ModuleProgressDto> getAllModulesProgressInCourse(@PathVariable String courseId) {
        // Implementation will be added later
        return null;
    }
}
