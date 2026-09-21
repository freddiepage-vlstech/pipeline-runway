package tech.vlstech.durion.companies.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import tech.vlstech.durion.companies.service.CompanyService;
import tech.vlstech.durion.companies.web.dto.CompanyCreateRequest;
import tech.vlstech.durion.companies.web.dto.CompanyDto;
import tech.vlstech.durion.companies.web.dto.CompanyPageDto;
import tech.vlstech.durion.companies.web.dto.CompanyUpdateRequest;

import java.util.UUID;

/**
 * Implements companies-service/openapi.yaml. Mapped at {@code /companies}
 * (not {@code /api/companies}) — the contract's {@code /api/companies}
 * server URL is the gateway-facing external path; INFRA-4's gateway is
 * assumed to route {@code /api/companies/**} to this service's own
 * {@code /companies/**} once it exists.
 */
@RestController
@RequestMapping("/companies")
@Validated
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    @GetMapping
    public CompanyPageDto listCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "50") @Min(1) @Max(200) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        return CompanyPageDto.from(service.list(search, includeInactive, pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyDto createCompany(@Valid @RequestBody CompanyCreateRequest request) {
        return CompanyDto.from(service.create(request.name(), request.domain()));
    }

    @GetMapping("/{companyId}")
    public CompanyDto getCompany(@PathVariable UUID companyId) {
        return CompanyDto.from(service.get(companyId));
    }

    @PatchMapping("/{companyId}")
    public CompanyDto updateCompany(@PathVariable UUID companyId, @Valid @RequestBody CompanyUpdateRequest request) {
        return CompanyDto.from(service.update(companyId, request.name(), request.domain()));
    }

    @DeleteMapping("/{companyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateCompany(@PathVariable UUID companyId) {
        service.deactivate(companyId);
    }

    @PostMapping("/{companyId}/reactivate")
    public CompanyDto reactivateCompany(@PathVariable UUID companyId) {
        return CompanyDto.from(service.reactivate(companyId));
    }
}
