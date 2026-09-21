package tech.vlstech.durion.companies.exception;

import org.springframework.http.HttpStatus;

/**
 * Base for every domain exception in this service, per ADR-0003: the
 * status is a required constructor argument, never decided at the point
 * something is thrown, and never inferred by a generic catch-all. See
 * {@code GlobalExceptionHandler} for the single, thin handler that reads
 * this status back off the exception.
 */
public abstract class DomainException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    protected DomainException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
