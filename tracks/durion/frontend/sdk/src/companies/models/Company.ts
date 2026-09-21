/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Company = {
    readonly id: string;
    name: string;
    /**
     * Website/domain, e.g. "acme.com".
     */
    domain?: string | null;
    /**
     * False once deactivated. Never hard-deleted, per ADR-0005.
     */
    readonly active: boolean;
    readonly deactivatedAt?: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

