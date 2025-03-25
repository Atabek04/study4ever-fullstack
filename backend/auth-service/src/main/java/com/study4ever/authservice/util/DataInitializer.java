package com.study4ever.authservice.util;

import com.study4ever.authservice.dto.Role;
import com.study4ever.authservice.repo.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        initRoles();
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
}
