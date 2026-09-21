package tech.vlstech.durion.companies.web;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import tech.vlstech.durion.companies.exception.DomainException;
import tech.vlstech.durion.companies.web.dto.ErrorResponse;

/**
 * The single, thin handler ADR-0003 requires: no per-exception-type
 * branching for domain exceptions — every one of them already carries its
 * own status and code (ADR-0003), this just reads it back off. The
 * validation handler is separate because request-shape validation
 * (ADR-0002's 400 case) isn't a domain refusal in the same sense.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomainException(DomainException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new ErrorResponse(ex.getStatus().value(), ex.getCode(), ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        var fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        var body = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "VALIDATION_FAILED",
                "Request validation failed", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    /** Request-shape validation on @RequestParam/@PathVariable constraints (e.g. page/size), not a request body. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        var fieldErrors = ex.getConstraintViolations().stream()
                .map(cv -> new ErrorResponse.FieldError(
                        cv.getPropertyPath().toString(), cv.getMessage()))
                .toList();
        var body = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "VALIDATION_FAILED",
                "Request validation failed", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }
}
