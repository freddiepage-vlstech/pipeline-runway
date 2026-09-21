package tech.vlstech.durion.companies;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * INFRA-1 scaffolding: the service exists, builds, and connects to its own
 * Postgres database (REQ-12). No business logic yet — see AGENTS.md's
 * build order and agents/services/companies-service.agent.md for what
 * governs this service once REQ-1's endpoints are implemented.
 */
@SpringBootApplication
public class CompaniesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompaniesServiceApplication.class, args);
    }
}
