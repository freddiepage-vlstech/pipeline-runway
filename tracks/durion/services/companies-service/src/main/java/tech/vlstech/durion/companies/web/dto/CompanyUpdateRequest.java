package tech.vlstech.durion.companies.web.dto;

import jakarta.validation.constraints.Size;

/**
 * Matches CompanyUpdateRequest in companies-service/openapi.yaml — every
 * field optional (PATCH), but per the contract's own {@code minLength: 1},
 * a name that's present can't be blanked out to an empty string.
 */
public record CompanyUpdateRequest(
        @Size(min = 1, max = 255) String name,
        @Size(max = 255) String domain
) {
}
