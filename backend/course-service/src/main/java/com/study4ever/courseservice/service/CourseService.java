package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.model.Course;

import java.util.List;

public interface CourseService {
    // Basic course methods
    List<CourseResponseDto> getAllCourses();

    CourseResponseDto getCourseById(Long id);

    // Detailed course methods with module information
    CourseDetailResponseDto getCourseDetailsById(Long id);

    List<CourseDetailResponseDto> getAllCoursesWithDetails();

    // Entity operations
    Course createCourse(CourseRequestDto courseRequestDto);

    CourseResponseDto saveCourse(CourseRequestDto courseRequestDto);

    CourseResponseDto updateCourse(Long id, CourseRequestDto courseRequestDto);

    void deleteCourse(Long id);
}