package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.ModuleRequestDto;
import com.study4ever.courseservice.model.Module;
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
    public List<Module> getAllModules() {
        return moduleService.getAllModules();
    }

    @GetMapping("/{id}")
    public Module getModuleById(@PathVariable Long id) {
        return moduleService.getModuleById(id);
    }

    @PostMapping
    public Module createModule(@Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.createModule(moduleRequestDto);
    }

    @PutMapping("/{id}")
    public Module updateModule(@PathVariable Long id, @Valid @RequestBody ModuleRequestDto moduleRequestDto) {
        return moduleService.updateModule(id, moduleRequestDto);
    }

    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}