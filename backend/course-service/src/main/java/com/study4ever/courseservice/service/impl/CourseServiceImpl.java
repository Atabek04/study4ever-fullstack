package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.repository.CourseRepository;
import com.study4ever.courseservice.service.CourseService;
import com.study4ever.courseservice.util.mapper.CourseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    public List<CourseResponseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(courseMapper::mapToResponseDto)
                .toList();
    }

    @Override
    public CourseResponseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return courseMapper.mapToResponseDto(course);
    }

    @Override
    public Course createCourse(CourseRequestDto courseRequestDto) {
        Course course = new Course();
        courseMapper.mapToCourse(course, courseRequestDto);
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long id, CourseRequestDto courseRequestDto) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseMapper.mapToCourse(existingCourse, courseRequestDto);
        return courseRepository.save(existingCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}