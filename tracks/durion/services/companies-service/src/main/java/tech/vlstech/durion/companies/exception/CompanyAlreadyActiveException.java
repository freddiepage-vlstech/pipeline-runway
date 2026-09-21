package tech.vlstech.durion.companies.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

/** Lifecycle-status collision — 409 per ADR-0002. */
public class CompanyAlreadyActiveException extends DomainException {

    public CompanyAlreadyActiveException(UUID companyId) {
        super(HttpStatus.CONFLICT, "COMPANY_ALREADY_ACTIVE",
                "Company " + companyId + " is already active");
    }
}
