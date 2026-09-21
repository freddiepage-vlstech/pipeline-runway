/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Opportunity = {
    readonly id: string;
    name: string;
    /**
     * Opaque reference to a Company in companies-service. Required (REQ-3).
     */
    companyId: string;
    /**
     * Opaque reference to a Contact in contacts-service. Optional (REQ-3).
     */
    personId?: string | null;
    stageId: string;
    /**
     * Currency amount. Negative values are a 422 (ADR-0002's own worked example).
     */
    amount: number;
    expectedCloseDate?: string | null;
    /**
     * Timestamp the opportunity entered its current stage (REQ-8).
     */
    readonly currentStageEnteredAt: string;
    /**
     * Set/cleared by this service reacting to company.deactivated/reactivated events (ADR-0005). Never written directly.
     */
    readonly companyInactive: boolean;
    /**
     * True when not moved/updated within the configurable threshold (REQ-10; default 14 days, ADR-0007).
     */
    readonly stale: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
};

