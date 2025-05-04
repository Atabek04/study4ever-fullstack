package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public List<CourseResponseDto> getAllCourses() {
        return courseService.getAllCourses();
    }
    
    @GetMapping("/details")
    public List<CourseDetailResponseDto> getAllCoursesWithDetails() {
        return courseService.getAllCoursesWithDetails();
    }

    @GetMapping("/{id}")
    public CourseResponseDto getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }
    
    @GetMapping("/{id}/details")
    public CourseDetailResponseDto getCourseDetailsById(@PathVariable Long id) {
        return courseService.getCourseDetailsById(id);
    }

    @PostMapping
    public CourseResponseDto createCourse(@Valid @RequestBody CourseRequestDto courseRequestDto) {
        return courseService.saveCourse(courseRequestDto);
    }

    @PutMapping("/{id}")
    public CourseResponseDto updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequestDto courseRequestDto) {
        return courseService.updateCourse(id, courseRequestDto);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}