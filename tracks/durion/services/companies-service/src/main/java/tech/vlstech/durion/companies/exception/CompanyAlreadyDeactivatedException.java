package tech.vlstech.durion.companies.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

/** Lifecycle-status collision — 409 per ADR-0002. */
public class CompanyAlreadyDeactivatedException extends DomainException {

    public CompanyAlreadyDeactivatedException(UUID companyId) {
        super(HttpStatus.CONFLICT, "COMPANY_ALREADY_INACTIVE",
                "Company " + companyId + " is already deactivated");
    }
}
