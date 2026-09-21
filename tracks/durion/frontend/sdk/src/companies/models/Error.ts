/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Every domain exception carries its own status per ADR-0003; this is that status surfaced on the wire, plus a stable machine-readable code for clients (e.g. the generated SDK, REQ-14's test suite).
 *
 */
export type Error = {
    /**
     * HTTP status, matches the response code.
     */
    status: number;
    /**
     * e.g. COMPANY_NOT_FOUND, COMPANY_ALREADY_INACTIVE, VALIDATION_FAILED.
     */
    code: string;
    message: string;
    /**
     * Present only for 400 request-shape validation failures.
     */
    fieldErrors?: Array<{
        field: string;
        message: string;
    }>;
};

