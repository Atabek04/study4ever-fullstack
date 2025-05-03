package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.model.Course;
import java.util.List;

public interface CourseService {
    List<CourseResponseDto> getAllCourses();
    CourseResponseDto getCourseById(Long id);
    Course createCourse(CourseRequestDto courseRequestDto);
    Course updateCourse(Long id, CourseRequestDto courseRequestDto);
    void deleteCourse(Long id);
}