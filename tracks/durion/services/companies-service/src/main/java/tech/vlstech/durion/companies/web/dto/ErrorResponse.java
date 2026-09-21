package tech.vlstech.durion.companies.web.dto;

import org.springframework.http.HttpStatus;

import java.util.List;

/** Matches the Error schema in companies-service/openapi.yaml (ADR-0003). */
public record ErrorResponse(
        int status,
        String code,
        String message,
        List<FieldError> fieldErrors
) {
    public record FieldError(String field, String message) {
    }

    public static ErrorResponse of(HttpStatus status, String code, String message) {
        return new ErrorResponse(status.value(), code, message, null);
    }
}
