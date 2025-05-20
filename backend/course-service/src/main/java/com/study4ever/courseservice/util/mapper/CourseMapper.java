package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.CourseDetailResponseDto;
import com.study4ever.courseservice.dto.CourseRequestDto;
import com.study4ever.courseservice.dto.CourseResponseDto;
import com.study4ever.courseservice.dto.ModuleSummaryDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Course;
import com.study4ever.courseservice.model.Module;
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
        long totalLessons = 0;

        if (course.getModules() != null) {
            totalModules = course.getModules().size();
            totalLessons = course.getModules().stream()
                    .mapToLong(module -> module.getLessons() != null ? module.getLessons().size() : 0)
                    .sum();
        }

        return CourseResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(course.getInstructor().getId())
                .totalModules(totalModules)
                .totalLessons((int) totalLessons)
                .build();
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
                    .map(this::mapToModuleSummaryDto)
                    .collect(Collectors.toSet()));
        }

        return detailDto;
    }

    private ModuleSummaryDto mapToModuleSummaryDto(Module module) {
        return ModuleSummaryDto.builder()
                .id(module.getId())
                .title(module.getTitle())
                .sortOrder(module.getSortOrder())
                .lessonCount(module.getLessons() != null ? module.getLessons().size() : 0)
                .build();
    }
}