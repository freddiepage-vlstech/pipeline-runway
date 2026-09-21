package tech.vlstech.durion.opportunities;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * INFRA-3 scaffolding: the service exists, builds, and connects to its own
 * Postgres database (REQ-12). No business logic yet — see AGENTS.md's
 * build order and agents/services/opportunities-service.agent.md for what
 * governs this service once its endpoints are implemented. Kafka wiring
 * (ext_companies_company / ext_contacts_person consumers, REQ-9's
 * publisher) is INFRA-6, not this issue.
 */
@SpringBootApplication
public class OpportunitiesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpportunitiesServiceApplication.class, args);
    }
}
