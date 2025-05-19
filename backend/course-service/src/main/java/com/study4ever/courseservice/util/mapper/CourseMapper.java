package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import com.study4ever.courseservice.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final UserReferenceRepository userReferenceRepository;
    private final TagService tagService;
    private final ModuleMapper moduleMapper;

    public Course mapToCourse(Course existingCourse, CourseRequestDto courseRequestDto) {
        existingCourse.setTitle(courseRequestDto.getTitle());
        existingCourse.setDescription(courseRequestDto.getDescription());
        existingCourse.setInstructor(userReferenceRepository.findById(courseRequestDto.getInstructorId())
                .orElseThrow(() -> new NotFoundException("Instructor not found")));
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

    public CourseDetailResponseDto mapToDetailResponseDto(Course course) {
        CourseDetailResponseDto detailDto = CourseDetailResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(course.getInstructor().getId())
                .build();

        if (course.getModules() != null) {
            detailDto.setModules(course.getModules().stream()
                    .map(moduleMapper::toDetailResponseDto)
                    .collect(Collectors.toSet()));
        }

        return detailDto;
    }
}