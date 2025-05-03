package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}