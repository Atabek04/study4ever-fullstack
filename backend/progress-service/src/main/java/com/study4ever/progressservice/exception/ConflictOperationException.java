package com.study4ever.progressservice.exception;

public class ConflictOperationException extends RuntimeException {
    public ConflictOperationException(String message) {
        super(message);
    }
    
    public ConflictOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
