package com.study4ever.courseservice.model;

import lombok.Getter;


@Getter
public enum Role {
    ROLE_ADMIN,
    ROLE_INSTRUCTOR,
    ROLE_STUDENT;

    public static Role fromString(String roleName) {
        try {
            return Role.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}