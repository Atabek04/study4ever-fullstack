package com.study4ever.courseservice.exception;

public class UserReferenceNotFoundException extends RuntimeException {
    public UserReferenceNotFoundException(String message) {
        super(message);
    }
}
