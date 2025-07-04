package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.ModuleDetailResponseDto;
import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.dto.ModuleResponseDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Module;
import com.study4ever.courseservice.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ModuleMapper {

    private final CourseRepository courseRepository;
    private final LessonMapper lessonMapper;

    public void mapToModule(Module existingModule, ModuleRequestDto moduleRequestDto) {
        existingModule.setTitle(moduleRequestDto.getTitle());
        existingModule.setSortOrder(moduleRequestDto.getSortOrder());
        existingModule.setCourse(courseRepository.findById(moduleRequestDto.getCourseId())
                .orElseThrow(() -> new NotFoundException("Course not found")));

    }

    public ModuleResponseDto toResponseDto(Module module) {
        return ModuleResponseDto.builder()
                .id(module.getId())
                .title(module.getTitle())
                .sortOrder(module.getSortOrder())
                .courseId(module.getCourse() != null ? module.getCourse().getId() : null)
                .lessonCount(module.getLessons() != null ? module.getLessons().size() : 0)
                .build();
    }

    public ModuleDetailResponseDto toDetailResponseDto(Module module) {
        ModuleDetailResponseDto responseDto = ModuleDetailResponseDto.builder()
                .id(module.getId())
                .title(module.getTitle())
                .sortOrder(module.getSortOrder())
                .courseId(module.getCourse() != null ? module.getCourse().getId() : null)
                .build();

        if (module.getLessons() != null) {
            responseDto.setLessons(module.getLessons().stream()
                    .map(lessonMapper::toSummaryResponseDto)
                    .collect(Collectors.toSet()));
        }

        return responseDto;
    }
}