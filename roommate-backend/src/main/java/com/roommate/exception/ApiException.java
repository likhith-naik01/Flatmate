package com.roommate.exception;

import org.springframework.http.HttpStatus;

// Custom runtime exception carrying an HTTP status code and an explainable error message
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
