package com.study4ever.courseservice.repository;

import com.study4ever.courseservice.model.UserReference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserReferenceRepository extends JpaRepository<UserReference, UUID> {
}
