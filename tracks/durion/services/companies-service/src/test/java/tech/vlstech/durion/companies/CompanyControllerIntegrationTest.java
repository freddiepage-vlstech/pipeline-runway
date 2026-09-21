package tech.vlstech.durion.companies;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-14 coverage for REQ-1: CRUD, plus ADR-0005's deactivate/reactivate
 * lifecycle and the 409s that come with it. Runs against H2, not a real
 * Postgres — see pom.xml's h2 dependency comment.
 *
 * {@code @Transactional} here rolls each test method's changes back at the
 * end of the method (safe with MockMvc's default MOCK web environment,
 * since everything runs on the test thread) — otherwise the Spring context
 * and its H2 database would be reused across methods with no isolation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CompanyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsListsGetsAndUpdatesACompany() throws Exception {
        String createBody = objectMapper.writeValueAsString(new CreateRequest("Acme Corp", "acme.com"));

        String createdJson = mockMvc.perform(post("/companies")
                        .contentType("application/json")
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Acme Corp"))
                .andExpect(jsonPath("$.domain").value("acme.com"))
                .andExpect(jsonPath("$.active").value(true))
                .andReturn().getResponse().getContentAsString();

        String companyId = objectMapper.readTree(createdJson).get("id").asText();

        mockMvc.perform(get("/companies/{id}", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp"));

        mockMvc.perform(get("/companies").param("search", "acme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Acme Corp"))
                .andExpect(jsonPath("$.totalElements").value(1));

        String updateBody = objectMapper.writeValueAsString(new UpdateRequest("Acme Corporation", null));
        mockMvc.perform(patch("/companies/{id}", companyId)
                        .contentType("application/json")
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corporation"))
                .andExpect(jsonPath("$.domain").value("acme.com"));
    }

    @Test
    void rejectsACompanyWithNoName() throws Exception {
        String body = objectMapper.writeValueAsString(new CreateRequest("", null));

        mockMvc.perform(post("/companies")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("name"));
    }

    @Test
    void returns404ForAnUnknownCompany() throws Exception {
        mockMvc.perform(get("/companies/{id}", "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COMPANY_NOT_FOUND"));
    }

    @Test
    void deactivateThenReactivateRoundTripsAndRejectsDoubleTransitions() throws Exception {
        String createdJson = mockMvc.perform(post("/companies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new CreateRequest("Globex", null))))
                .andReturn().getResponse().getContentAsString();
        String companyId = objectMapper.readTree(createdJson).get("id").asText();

        mockMvc.perform(delete("/companies/{id}", companyId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/companies/{id}", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        // Deactivating an already-deactivated company is a lifecycle-status
        // collision — 409, per ADR-0002.
        mockMvc.perform(delete("/companies/{id}", companyId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COMPANY_ALREADY_INACTIVE"));

        mockMvc.perform(post("/companies/{id}/reactivate", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        // Symmetric 409 on the other side.
        mockMvc.perform(post("/companies/{id}/reactivate", companyId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COMPANY_ALREADY_ACTIVE"));
    }

    private record CreateRequest(String name, String domain) {
    }

    private record UpdateRequest(String name, String domain) {
    }
}
