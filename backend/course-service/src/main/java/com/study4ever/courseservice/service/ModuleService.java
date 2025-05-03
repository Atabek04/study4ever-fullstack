package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.model.Module;
import java.util.List;

public interface ModuleService {
    
    List<Module> getAllModules();

    Module getModuleById(Long id);

    Module createModule(ModuleRequestDto moduleRequestDto);

    Module updateModule(Long id, ModuleRequestDto moduleRequestDto);

    void deleteModule(Long id);
}