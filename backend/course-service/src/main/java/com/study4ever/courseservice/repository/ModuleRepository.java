package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, Long> {
}