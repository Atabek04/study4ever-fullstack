package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.model.Module;
import com.study4ever.courseservice.repository.CourseRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleMapper {

    private final CourseRepository courseRepository;

    public Module mapToModule(Module existingModule, ModuleRequestDto moduleRequestDto) { // todo check if it's work with void
        existingModule.setTitle(moduleRequestDto.getTitle());
        existingModule.setSortOrder(moduleRequestDto.getSortOrder());
        existingModule.setCourse(courseRepository.findById(moduleRequestDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found")));

        return existingModule;
    }
}