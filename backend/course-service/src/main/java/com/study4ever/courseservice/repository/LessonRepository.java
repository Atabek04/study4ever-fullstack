package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}