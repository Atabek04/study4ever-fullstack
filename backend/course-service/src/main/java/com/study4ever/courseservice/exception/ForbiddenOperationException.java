package com.study4ever.courseservice.exception;

public class ForbiddenOperationException extends RuntimeException {
    public ForbiddenOperationException(String message) {
        super(message);
    }
    
    public ForbiddenOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
