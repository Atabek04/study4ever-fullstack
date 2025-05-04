package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.dto.ModuleResponseDto;
import com.study4ever.courseservice.dto.ModuleDetailResponseDto;
import com.study4ever.courseservice.model.Module;
import com.study4ever.courseservice.repository.ModuleRepository;
import com.study4ever.courseservice.service.ModuleService;
import com.study4ever.courseservice.util.mapper.ModuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    @Override
    public List<ModuleResponseDto> getAllModules() {
        return moduleRepository.findAll().stream()
                .map(moduleMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public ModuleResponseDto getModuleById(Long id) {
        return moduleMapper.toResponseDto(getModuleEntityById(id));
    }
    
    @Override
    public List<ModuleDetailResponseDto> getAllModulesWithDetails() {
        return moduleRepository.findAll().stream()
                .map(moduleMapper::toDetailResponseDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public ModuleDetailResponseDto getModuleDetailsById(Long id) {
        return moduleMapper.toDetailResponseDto(getModuleEntityById(id));
    }
    
    @Override
    public Module getModuleEntityById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
    }

    @Override
    public ModuleResponseDto createModule(ModuleRequestDto moduleRequestDto) {
        Module module = new Module();
        moduleMapper.mapToModule(module, moduleRequestDto);
        Module savedModule = moduleRepository.save(module);
        return moduleMapper.toResponseDto(savedModule);
    }

    @Override
    public ModuleResponseDto updateModule(Long id, ModuleRequestDto moduleRequestDto) {
        Module existingModule = getModuleEntityById(id);
        moduleMapper.mapToModule(existingModule, moduleRequestDto);
        Module updatedModule = moduleRepository.save(existingModule);
        return moduleMapper.toResponseDto(updatedModule);
    }

    @Override
    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}