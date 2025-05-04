package com.study4ever.courseservice.exception;

public class InvalidInstructorRoleException extends RuntimeException {

    public InvalidInstructorRoleException(String message) {
        super(message);
    }

    public InvalidInstructorRoleException(String message, Throwable cause) {
        super(message, cause);
    }
}