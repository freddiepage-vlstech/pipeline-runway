/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Contact = {
    readonly id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    /**
     * Opaque reference to a Company in companies-service. Null means unassigned (REQ-2).
     */
    companyId?: string | null;
    readonly active: boolean;
    readonly deactivatedAt?: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

