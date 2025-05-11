package com.study4ever.courseservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SortOrderConflictException extends RuntimeException {
    public SortOrderConflictException(String message) {
        super(message);
    }
}
