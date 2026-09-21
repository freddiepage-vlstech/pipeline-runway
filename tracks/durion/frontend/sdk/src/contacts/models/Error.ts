/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Error = {
    status: number;
    /**
     * e.g. CONTACT_NOT_FOUND, CONTACT_ALREADY_INACTIVE, VALIDATION_FAILED.
     */
    code: string;
    message: string;
    fieldErrors?: Array<{
        field: string;
        message: string;
    }>;
};

