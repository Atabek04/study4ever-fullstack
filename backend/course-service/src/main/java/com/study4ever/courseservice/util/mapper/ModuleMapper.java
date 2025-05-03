package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.model.Module;
import com.study4ever.courseservice.service.ModuleService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleMapper {

    private final CourseService courseService;

    public Module mapToModule(Module existingModule, ModuleRequestDto moduleRequestDto) {
        existingModule.setTitle(moduleRequestDto.getTitle());
        existingModule.setSortOrder(moduleRequestDto.getSortOrder());
        existingModule.setCourse(courseService.getCourseById(moduleRequestDto.getCourseId()));
        return existingModule;
    }
}