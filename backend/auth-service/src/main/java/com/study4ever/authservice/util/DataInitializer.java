package com.study4ever.authservice.util;

import com.study4ever.authservice.model.Role;
import com.study4ever.authservice.model.UserCredentials;
import com.study4ever.authservice.repo.RoleRepository;
import com.study4ever.authservice.repo.UserCredentialsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserCredentialsRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initAdminUser();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            Arrays.stream(Role.RoleName.values())
                    .forEach(roleName -> {
                        Role role = new Role();
                        role.setName(roleName);
                        roleRepository.save(role);
                    });

            log.info("Default roles initialized");
        }
    }
    
    private void initAdminUser() {
        String adminUsername = "ibnmalik";
        String adminEmail = "ibn_malik@gmail.com";
        String adminPassword = "Admin@123";
        String adminFirstName = "Ibn";
        String adminLastName = "Malik";
        
        if (!userRepository.existsByUsername(adminUsername)) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            
            UserCredentials adminUser = UserCredentials.builder()
                    .username(adminUsername)
                    .firstName(adminFirstName)
                    .lastName(adminLastName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .roles(roles)
                    .isAccountNonExpired(true)
                    .isAccountNonLocked(true) 
                    .isCredentialsNonExpired(true)
                    .isEnabled(true)
                    .build();
            
            userRepository.save(adminUser);
            
            log.info("Admin user '{}' initialized", adminUsername);
        }
    }
}
