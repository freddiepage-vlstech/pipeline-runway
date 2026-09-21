package tech.vlstech.durion.contacts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * INFRA-2 scaffolding: the service exists, builds, and connects to its own
 * Postgres database (REQ-12). No business logic yet — see AGENTS.md's
 * build order and agents/services/contacts-service.agent.md for what
 * governs this service once REQ-2's endpoints are implemented.
 */
@SpringBootApplication
public class ContactsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContactsServiceApplication.class, args);
    }
}
