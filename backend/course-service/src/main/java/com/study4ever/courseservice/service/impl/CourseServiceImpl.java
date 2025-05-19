package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.exception.InvalidInstructorRoleException;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.model.Role;
import com.study4ever.courseservice.repository.CourseRepository;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import com.study4ever.courseservice.service.CourseService;
import com.study4ever.courseservice.util.mapper.CourseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserReferenceRepository userRepository;
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
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return courseMapper.mapToResponseDto(course);
    }

    @Override
    public CourseDetailResponseDto getCourseDetailsById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return courseMapper.mapToDetailResponseDto(course);
    }

    @Override
    public List<CourseDetailResponseDto> getAllCoursesWithDetails() {
        return courseRepository.findAll().stream()
                .map(courseMapper::mapToDetailResponseDto)
                .toList();
    }

    @Override
    public List<CourseDetailResponseDto> getCoursesWithDetails(Long id) {
        return courseRepository.findById(id)
                .map(course -> List.of(courseMapper.mapToDetailResponseDto(course)))
                .orElseThrow(() -> new NotFoundException("Course not found"));
    }

    @Override
    public Course createCourse(CourseRequestDto courseRequestDto) {
        var course = courseMapper.mapToCourse(new Course(), courseRequestDto);
        return courseRepository.save(course);
    }

    @Override
    public CourseResponseDto saveCourse(CourseRequestDto courseRequestDto) {
        var instructor = userRepository.findById(courseRequestDto.getInstructorId())
                .orElseThrow(() -> new NotFoundException("Instructor with this ID not found"));

        if (!instructor.getRoles().contains(Role.ROLE_INSTRUCTOR)) {
            throw new InvalidInstructorRoleException("User is not an instructor");
        }

        var course = courseMapper.mapToCourse(new Course(), courseRequestDto);
        Course savedCourse = courseRepository.save(course);
        return courseMapper.mapToResponseDto(savedCourse);
    }

    @Override
    public CourseResponseDto updateCourse(Long id, CourseRequestDto courseRequestDto) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));

        courseMapper.mapToCourse(existingCourse, courseRequestDto);
        Course updatedCourse = courseRepository.save(existingCourse);
        return courseMapper.mapToResponseDto(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}