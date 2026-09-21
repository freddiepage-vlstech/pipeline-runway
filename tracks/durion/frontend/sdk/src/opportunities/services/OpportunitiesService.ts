/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Opportunity } from '../models/Opportunity';
import type { OpportunityCreateRequest } from '../models/OpportunityCreateRequest';
import type { OpportunityDetail } from '../models/OpportunityDetail';
import type { OpportunityPage } from '../models/OpportunityPage';
import type { OpportunitySummary } from '../models/OpportunitySummary';
import type { OpportunityUpdateRequest } from '../models/OpportunityUpdateRequest';
import type { StageHistoryEntry } from '../models/StageHistoryEntry';
import { BaseHttpRequest } from '../core/BaseHttpRequest';
@Injectable({
    providedIn: 'root',
})
export class OpportunitiesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List opportunities (REQ-5 table view, REQ-4 kanban view)
     * @param stageId
     * @param companyId
     * @param stale Filter to only stale (REQ-10) or only non-stale opportunities.
     * @param sort Any field on Opportunity, e.g. `amount`, `-expectedCloseDate` (leading `-` = descending). REQ-5.
     * @param page
     * @param size
     * @returns OpportunityPage A page of opportunities.
     * @throws ApiError
     */
    public listOpportunities(
        stageId?: string,
        companyId?: string,
        stale?: boolean,
        sort?: string,
        page?: number,
        size: number = 50,
    ): Observable<OpportunityPage> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/opportunities',
            query: {
                'stageId': stageId,
                'companyId': companyId,
                'stale': stale,
                'sort': sort,
                'page': page,
                'size': size,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
    /**
     * Create an opportunity
     * @param requestBody
     * @returns Opportunity Opportunity created.
     * @throws ApiError
     */
    public createOpportunity(
        requestBody: OpportunityCreateRequest,
    ): Observable<Opportunity> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/opportunities',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
                422: `Domain-policy refusal — e.g. negative amount, or companyId doesn't resolve against the ext_companies_company replica (ADR-0002: not an identity/version/lifecycle collision, so 422 not 409).
                `,
            },
        });
    }
    /**
     * Per-stage and total pipeline value rollup (REQ-7)
     * @returns OpportunitySummary Rollup of open-pipeline value.
     * @throws ApiError
     */
    public getOpportunitySummary(): Observable<OpportunitySummary> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/opportunities/summary',
            errors: {
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
    /**
     * Get an opportunity's full detail (REQ-11 record page)
     * Includes the fields REQ-11 asks for: all Opportunity fields, its related Company and Person (summarized, fetched from this service's own replicas — never a live call to companies-service/contacts-service, per ADR-0001), and a pointer to the stage-history endpoint below for the audit trail.
     *
     * @param opportunityId
     * @returns OpportunityDetail The opportunity, with related-record summaries.
     * @throws ApiError
     */
    public getOpportunity(
        opportunityId: string,
    ): Observable<OpportunityDetail> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/opportunities/{opportunityId}',
            path: {
                'opportunityId': opportunityId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No opportunity exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
            },
        });
    }
    /**
     * Update an opportunity, including moving its stage
     * Moving `stageId` to a stage where `isClosedWon` is true publishes `opportunity.closed_won` on the topic INFRA-6 defines (REQ-9). Once an opportunity is in a stage with `isClosedWon` or `isClosedLost` true, further stage changes are rejected with 409 — this is ADR-0002's own worked example ("editing an Opportunity that's already Closed Won") made concrete.
     *
     * @param opportunityId
     * @param requestBody
     * @returns Opportunity Updated opportunity.
     * @throws ApiError
     */
    public updateOpportunity(
        opportunityId: string,
        requestBody: OpportunityUpdateRequest,
    ): Observable<Opportunity> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/opportunities/{opportunityId}',
            path: {
                'opportunityId': opportunityId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
                404: `No opportunity exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
                409: `The opportunity's current stage is closed (won or lost) and its stage cannot be changed further (ADR-0002).`,
                422: `Domain-policy refusal that isn't an identity/version/lifecycle collision (ADR-0002).`,
            },
        });
    }
    /**
     * Delete an opportunity
     * Real (hard) delete — unlike Company/Contact, nothing else in this system holds a reference to an Opportunity, so ADR-0005's soft-delete rationale (protecting dependents from a dangling reference) doesn't apply here.
     *
     * @param opportunityId
     * @returns void
     * @throws ApiError
     */
    public deleteOpportunity(
        opportunityId: string,
    ): Observable<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/opportunities/{opportunityId}',
            path: {
                'opportunityId': opportunityId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No opportunity exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
            },
        });
    }
    /**
     * Stage-change audit trail (REQ-11, REQ-8)
     * @param opportunityId
     * @returns StageHistoryEntry Ordered list of stage transitions, oldest first.
     * @throws ApiError
     */
    public getOpportunityStageHistory(
        opportunityId: string,
    ): Observable<Array<StageHistoryEntry>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/opportunities/{opportunityId}/stage-history',
            path: {
                'opportunityId': opportunityId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No opportunity exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
            },
        });
    }
}
