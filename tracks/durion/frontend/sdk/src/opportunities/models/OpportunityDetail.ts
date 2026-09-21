/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Opportunity } from './Opportunity';
import type { RelatedRecordSummary } from './RelatedRecordSummary';
export type OpportunityDetail = (Opportunity & {
    company?: RelatedRecordSummary;
    person?: RelatedRecordSummary | null;
});

