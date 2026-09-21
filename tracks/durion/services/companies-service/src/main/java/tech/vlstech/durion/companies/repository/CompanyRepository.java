package tech.vlstech.durion.companies.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tech.vlstech.durion.companies.domain.Company;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    @Query("""
            SELECT c FROM Company c
            WHERE (:includeInactive = true OR c.deactivatedAt IS NULL)
              AND (:search IS NULL
                   OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.domain) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Company> search(@Param("search") String search,
                          @Param("includeInactive") boolean includeInactive,
                          Pageable pageable);
}
