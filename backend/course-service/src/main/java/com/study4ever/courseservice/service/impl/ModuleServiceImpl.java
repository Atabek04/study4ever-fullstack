package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.model.Module;
import com.study4ever.courseservice.repository.ModuleRepository;
import com.study4ever.courseservice.service.ModuleService;
import com.study4ever.courseservice.util.mapper.ModuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    @Override
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    @Override
    public Module getModuleById(Long id) {
        return moduleRepository.findById(id).orElseThrow(() -> new RuntimeException("Module not found"));
    }

    @Override
    public Module createModule(ModuleRequestDto moduleRequestDto) {
        Module module = new Module();
        moduleMapper.mapToModule(module, moduleRequestDto);
        return moduleRepository.save(module);
    }

    @Override
    public Module updateModule(Long id, ModuleRequestDto moduleRequestDto) {
        Module existingModule = getModuleById(id);
        moduleMapper.mapToModule(existingModule, moduleRequestDto);
        return moduleRepository.save(existingModule);
    }

    @Override
    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}