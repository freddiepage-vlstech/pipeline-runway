package tech.vlstech.durion.companies.web.dto;

import org.springframework.data.domain.Page;

import tech.vlstech.durion.companies.domain.Company;

import java.util.List;

/** Matches CompanyPage in companies-service/openapi.yaml. */
public record CompanyPageDto(
        List<CompanyDto> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static CompanyPageDto from(Page<Company> page) {
        return new CompanyPageDto(
                page.getContent().stream().map(CompanyDto::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
