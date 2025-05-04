package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.dto.CourseDetailResponseDto;
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
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return courseMapper.mapToResponseDto(course);
    }
    
    @Override
    public CourseDetailResponseDto getCourseDetailsById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return courseMapper.mapToDetailResponseDto(course);
    }
    
    @Override
    public List<CourseDetailResponseDto> getAllCoursesWithDetails() {
        return courseRepository.findAll().stream()
                .map(courseMapper::mapToDetailResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public Course createCourse(CourseRequestDto courseRequestDto) {
        Course course = new Course();
        courseMapper.mapToCourse(course, courseRequestDto);
        return courseRepository.save(course);
    }
    
    @Override
    public CourseResponseDto saveCourse(CourseRequestDto courseRequestDto) {
        Course course = new Course();
        courseMapper.mapToCourse(course, courseRequestDto);
        Course savedCourse = courseRepository.save(course);
        return courseMapper.mapToResponseDto(savedCourse);
    }

    @Override
    public CourseResponseDto updateCourse(Long id, CourseRequestDto courseRequestDto) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseMapper.mapToCourse(existingCourse, courseRequestDto);
        Course updatedCourse = courseRepository.save(existingCourse);
        return courseMapper.mapToResponseDto(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}