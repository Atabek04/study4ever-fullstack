package com.study4ever.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.study4ever.courseservice.model.UserReference;

public interface UserReferenceRepository extends JpaRepository<UserReference, Long> {
}
