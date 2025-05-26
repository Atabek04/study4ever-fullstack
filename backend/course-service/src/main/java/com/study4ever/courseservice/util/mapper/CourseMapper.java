package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.model.Tag;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import com.study4ever.courseservice.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
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
        int totalModules = 0;
        int totalLessons = 0;

        if (course.getModules() != null) {
            totalModules = course.getModules().size();
            totalLessons = course.getModules().stream()
                    .filter(module -> module.getLessons() != null)
                    .mapToInt(module -> module.getLessons().size())
                    .sum();
        }

        Set<Long> tagIds = course.getTags().stream()
                .map(Tag::getId)
                .collect(Collectors.toSet());

        return CourseResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(course.getInstructor().getId())
                .instructorFirstName(course.getInstructor().getFirstName())
                .instructorLastName(course.getInstructor().getLastName())
                .totalModules(totalModules)
                .totalLessons(totalLessons)
                .tagIds(tagIds)
                .build();
    }

    public CourseDetailResponseDto mapToDetailResponseDto(Course course) {
        Set<Long> tagIds = course.getTags().stream()
                .map(Tag::getId)
                .collect(Collectors.toSet());

        CourseDetailResponseDto detailDto = CourseDetailResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(course.getInstructor().getId())
                .tagIds(tagIds)
                .build();

        if (course.getModules() != null) {
            detailDto.setModules(course.getModules().stream()
                    .map(moduleMapper::toDetailResponseDto)
                    .collect(Collectors.toSet()));
        }

        return detailDto;
    }
}