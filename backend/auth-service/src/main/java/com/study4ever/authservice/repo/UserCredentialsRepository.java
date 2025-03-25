package com.study4ever.authservice.repo;

import com.study4ever.authservice.dto.UserCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCredentialsRepository extends JpaRepository<UserCredentials, UUID> {

    Optional<UserCredentials> findByUsername(String username);

    Optional<UserCredentials> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
