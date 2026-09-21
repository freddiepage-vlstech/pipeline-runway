/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Error = {
    status: number;
    /**
     * e.g. OPPORTUNITY_NOT_FOUND, OPPORTUNITY_STAGE_LOCKED, VALIDATION_FAILED.
     */
    code: string;
    message: string;
    fieldErrors?: Array<{
        field: string;
        message: string;
    }>;
};

