package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
}