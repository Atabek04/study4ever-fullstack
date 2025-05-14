package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.CourseFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseFeedbackRepository extends JpaRepository<CourseFeedback, Long> {
}