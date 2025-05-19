package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.ModuleDetailResponseDto;
import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.dto.ModuleResponseDto;
import com.study4ever.courseservice.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleResponseDto createModule(@Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.createModule(moduleRequestDto);
    }

    @GetMapping
    public List<ModuleResponseDto> getAllModules() {
        return moduleService.getAllModules();
    }

    @GetMapping("/details")
    public List<ModuleDetailResponseDto> getAllModulesWithDetails() {
        return moduleService.getAllModulesWithDetails();
    }

    @GetMapping("/{id}")
    public ModuleResponseDto getModuleById(@PathVariable("id") Long id) {
        return moduleService.getModuleById(id);
    }

    @GetMapping("/{id}/details")
    public ModuleDetailResponseDto getModuleDetailsById(@PathVariable("id") Long id) {
        return moduleService.getModuleDetailsById(id);
    }

    @PutMapping("/{id}")
    public ModuleResponseDto updateModule(@PathVariable("id") Long id, @Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.updateModule(id, moduleRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteModule(@PathVariable("id") Long id) {
        moduleService.deleteModule(id);
    }
}