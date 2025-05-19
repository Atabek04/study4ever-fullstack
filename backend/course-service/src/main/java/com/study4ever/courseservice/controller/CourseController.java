package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponseDto createCourse(@Valid @RequestBody CourseRequestDto courseRequestDto) {
        return courseService.saveCourse(courseRequestDto);
    }

    @GetMapping
    public List<CourseResponseDto> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/details")
    public List<CourseDetailResponseDto> getAllCoursesWithDetails() {
        return courseService.getAllCoursesWithDetails();
    }

    @GetMapping("/{id}")
    public CourseResponseDto getCourseById(@PathVariable("id") Long id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/{id}/details")
    public CourseDetailResponseDto getCourseDetailsById(@PathVariable("id") Long id) {
        return courseService.getCourseDetailsById(id);
    }

    @PutMapping("/{id}")
    public CourseResponseDto updateCourse(@PathVariable("id") Long id, @Valid @RequestBody CourseRequestDto courseRequestDto) {
        return courseService.updateCourse(id, courseRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable("id") Long id) {
        courseService.deleteCourse(id);
    }
}