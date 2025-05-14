package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.dto.ModuleResponseDto;
import com.study4ever.courseservice.dto.ModuleDetailResponseDto;
import com.study4ever.courseservice.model.Module;
import java.util.List;

public interface ModuleService {
    // Basic module methods without lessons
    List<ModuleResponseDto> getAllModules();
    ModuleResponseDto getModuleById(Long id);
    
    // Detailed module methods with lessons
    List<ModuleDetailResponseDto> getAllModulesWithDetails();
    ModuleDetailResponseDto getModuleDetailsById(Long id);
    
    // Entity access for internal use only
    Module getModuleEntityById(Long id);

    // Create/Update operations that return appropriate DTOs
    ModuleResponseDto createModule(ModuleRequestDto moduleRequestDto);
    ModuleResponseDto updateModule(Long id, ModuleRequestDto moduleRequestDto);
    
    // Delete operation
    void deleteModule(Long id);
}