package tech.vlstech.durion.companies.web.dto;

import tech.vlstech.durion.companies.domain.Company;

import java.time.Instant;
import java.util.UUID;

/** Matches the Company schema in companies-service/openapi.yaml. */
public record CompanyDto(
        UUID id,
        String name,
        String domain,
        boolean active,
        Instant deactivatedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static CompanyDto from(Company company) {
        return new CompanyDto(
                company.getId(),
                company.getName(),
                company.getDomain(),
                company.isActive(),
                company.getDeactivatedAt(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
