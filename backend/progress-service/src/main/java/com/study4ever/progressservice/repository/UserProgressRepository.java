package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, String> {
}
