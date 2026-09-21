package tech.vlstech.durion.companies.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import tech.vlstech.durion.companies.domain.Company;
import tech.vlstech.durion.companies.exception.CompanyAlreadyActiveException;
import tech.vlstech.durion.companies.exception.CompanyAlreadyDeactivatedException;
import tech.vlstech.durion.companies.exception.CompanyNotFoundException;
import tech.vlstech.durion.companies.repository.CompanyRepository;
import tech.vlstech.durion.companies.service.event.CompanyEventPublisher;

import java.time.Instant;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository repository;
    private final CompanyEventPublisher eventPublisher;

    public CompanyService(CompanyRepository repository, CompanyEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<Company> list(String search, boolean includeInactive, Pageable pageable) {
        String normalizedSearch = StringUtils.hasText(search) ? search : null;
        return repository.search(normalizedSearch, includeInactive, pageable);
    }

    @Transactional(readOnly = true)
    public Company get(UUID companyId) {
        return repository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));
    }

    @Transactional
    public Company create(String name, String domain) {
        return repository.save(new Company(name, domain));
    }

    @Transactional
    public Company update(UUID companyId, String name, String domain) {
        Company company = get(companyId);
        if (name != null) {
            company.setName(name);
        }
        if (domain != null) {
            company.setDomain(domain);
        }
        return repository.save(company);
    }

    /** ADR-0005: soft-delete plus a published lifecycle event. */
    @Transactional
    public void deactivate(UUID companyId) {
        Company company = get(companyId);
        if (!company.isActive()) {
            throw new CompanyAlreadyDeactivatedException(companyId);
        }
        company.setDeactivatedAt(Instant.now());
        repository.save(company);
        eventPublisher.companyDeactivated(companyId);
    }

    /** ADR-0005: symmetric counterpart to {@link #deactivate}. */
    @Transactional
    public Company reactivate(UUID companyId) {
        Company company = get(companyId);
        if (company.isActive()) {
            throw new CompanyAlreadyActiveException(companyId);
        }
        company.setDeactivatedAt(null);
        Company saved = repository.save(company);
        eventPublisher.companyReactivated(companyId);
        return saved;
    }
}
