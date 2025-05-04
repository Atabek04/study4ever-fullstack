package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.dto.ModuleResponseDto;
import com.study4ever.courseservice.dto.ModuleDetailResponseDto;
import com.study4ever.courseservice.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public List<ModuleResponseDto> getAllModules() {
        return moduleService.getAllModules();
    }
    
    @GetMapping("/details")
    public List<ModuleDetailResponseDto> getAllModulesWithDetails() {
        return moduleService.getAllModulesWithDetails();
    }

    @GetMapping("/{id}")
    public ModuleResponseDto getModuleById(@PathVariable Long id) {
        return moduleService.getModuleById(id);
    }
    
    @GetMapping("/{id}/details")
    public ModuleDetailResponseDto getModuleDetailsById(@PathVariable Long id) {
        return moduleService.getModuleDetailsById(id);
    }

    @PostMapping
    public ModuleResponseDto createModule(@Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.createModule(moduleRequestDto);
    }

    @PutMapping("/{id}")
    public ModuleResponseDto updateModule(@PathVariable Long id, @Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.updateModule(id, moduleRequestDto);
    }

    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}