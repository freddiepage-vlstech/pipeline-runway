package tech.vlstech.durion.companies.service.event;

import java.util.UUID;

/**
 * The publishing side of ADR-0005's announce-and-flag pattern:
 * {@code company.deactivated} / {@code company.reactivated} on
 * {@code company.events.v1} (ADR-0001).
 *
 * {@link CompanyService} depends on this interface, not a concrete Kafka
 * producer, so it can be implemented and tested now without a broker.
 * {@link LoggingCompanyEventPublisher} is a placeholder implementation —
 * see its Javadoc for what a real implementation still needs to do.
 */
public interface CompanyEventPublisher {

    void companyDeactivated(UUID companyId);

    void companyReactivated(UUID companyId);
}
