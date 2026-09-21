package tech.vlstech.durion.companies.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

/**
 * A plain resource-lookup miss, not an ADR-0002 domain-refusal
 * classification — see companies-service/openapi.yaml's NotFound response
 * description for why 404 sits outside that three-question test. Still
 * follows ADR-0003's structural pattern (status declared on the exception
 * class) for consistency with every other exception in this service.
 */
public class CompanyNotFoundException extends DomainException {

    public CompanyNotFoundException(UUID companyId) {
        super(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "No company exists with id " + companyId);
    }
}
