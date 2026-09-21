package tech.vlstech.durion.contacts;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Placeholder so `mvn verify` (ci-durion.yml's build-and-test job) has a
 * real test to run. Deliberately does NOT load the Spring context — that
 * would require a live Postgres connection this CI job doesn't provide
 * (only compose-smoke-test brings up the real stack). REQ-14 replaces this
 * with the track's real automated test suite once REQ-2's endpoints exist.
 */
class ScaffoldSmokeTest {

    @Test
    void placeholder() {
        assertTrue(true);
    }
}
