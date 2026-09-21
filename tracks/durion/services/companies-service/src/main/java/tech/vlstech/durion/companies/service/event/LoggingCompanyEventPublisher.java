package tech.vlstech.durion.companies.service.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Placeholder {@link CompanyEventPublisher} — logs instead of publishing to
 * Kafka. This service has no Kafka dependency yet; wiring a real producer
 * is INFRA-6's job, not REQ-1's. Two things a real implementation still
 * needs beyond swapping this class out, both from ADR-0001's Decision:
 *
 * <ol>
 *   <li>A transactional outbox — this method is called directly inside
 *       {@code CompanyService}'s {@code @Transactional} methods, so a
 *       real Kafka publish here would not be atomic with the database
 *       write. ADR-0001 requires writing to an {@code event_outbox} table
 *       in the same transaction instead, with a separate relay process
 *       publishing from it.</li>
 *   <li>{@code INFRA-6}'s own issue text (as scoped when this was
 *       written) only mentions REQ-9/REQ-10's automation-trigger events —
 *       not {@code company.events.v1}/{@code contact.events.v1}, which
 *       ADR-0001 and ADR-0005 already commit to. Worth expanding that
 *       issue's scope, or splitting this out, before INFRA-6 is picked
 *       up.</li>
 * </ol>
 */
@Component
public class LoggingCompanyEventPublisher implements CompanyEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LoggingCompanyEventPublisher.class);

    @Override
    public void companyDeactivated(UUID companyId) {
        log.info("[placeholder publisher] company.deactivated companyId={}", companyId);
    }

    @Override
    public void companyReactivated(UUID companyId) {
        log.info("[placeholder publisher] company.reactivated companyId={}", companyId);
    }
}
