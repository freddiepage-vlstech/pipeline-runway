-- REQ-1: the Company aggregate. deactivated_at is the soft-delete marker
-- per ADR-0005 — this table never has rows removed by the application,
-- only this column set/cleared.
CREATE TABLE companies (
    id             UUID PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    domain         VARCHAR(255),
    deactivated_at TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_companies_name ON companies (name);
