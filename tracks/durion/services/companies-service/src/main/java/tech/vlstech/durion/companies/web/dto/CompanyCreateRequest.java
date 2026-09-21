package tech.vlstech.durion.companies.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Matches CompanyCreateRequest in companies-service/openapi.yaml. */
public record CompanyCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String domain
) {
}
