package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.service.TagService;

import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    private final UserReferenceService userService;
    private final TagService tagService;

    public Course mapToCourse(Course existingCourse, CourseRequestDto courseRequestDto) {
        existingCourse.setTitle(courseRequestDto.getTitle());
        existingCourse.setDescription(courseRequestDto.getDescription());
        existingCourse.setInstructor(userService.getUserById(courseRequestDto.getInstructorId()));
        existingCourse.setTags(tagService.getTagsByIds(courseRequestDto.getTagIds()));
        return existingCourse;
    }

    public CourseResponseDto mapToResponseDto(Course course) {
        CourseResponseDto responseDto = new CourseResponseDto();
        responseDto.setId(course.getId());
        responseDto.setTitle(course.getTitle());
        responseDto.setDescription(course.getDescription());
        responseDto.setInstructorId(course.getInstructor().getId());
        return responseDto;
    }
}