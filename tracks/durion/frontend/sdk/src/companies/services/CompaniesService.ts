/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Company } from '../models/Company';
import type { CompanyCreateRequest } from '../models/CompanyCreateRequest';
import type { CompanyPage } from '../models/CompanyPage';
import type { CompanyUpdateRequest } from '../models/CompanyUpdateRequest';
import { BaseHttpRequest } from '../core/BaseHttpRequest';
@Injectable({
    providedIn: 'root',
})
export class CompaniesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List companies
     * @param search Case-insensitive match against name or domain.
     * @param includeInactive Include deactivated (soft-deleted) companies. Default false.
     * @param page
     * @param size
     * @returns CompanyPage A page of companies.
     * @throws ApiError
     */
    public listCompanies(
        search?: string,
        includeInactive: boolean = false,
        page?: number,
        size: number = 50,
    ): Observable<CompanyPage> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/companies',
            query: {
                'search': search,
                'includeInactive': includeInactive,
                'page': page,
                'size': size,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
    /**
     * Create a company
     * @param requestBody
     * @returns Company Company created.
     * @throws ApiError
     */
    public createCompany(
        requestBody: CompanyCreateRequest,
    ): Observable<Company> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/companies',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002 — never a domain-policy refusal).`,
                403: `Authorization failure (ADR-0002).`,
                422: `Domain-policy refusal that isn't an identity/version/lifecycle collision (ADR-0002).`,
            },
        });
    }
    /**
     * Get a company by ID
     * @param companyId
     * @returns Company The company.
     * @throws ApiError
     */
    public getCompany(
        companyId: string,
    ): Observable<Company> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/companies/{companyId}',
            path: {
                'companyId': companyId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No company exists with that ID. Plain resource-lookup miss — ADR-0002's classification test covers domain refusals, not existence lookups, so this uses standard REST semantics rather than the 403/409/422 test.
                `,
            },
        });
    }
    /**
     * Partially update a company
     * @param companyId
     * @param requestBody
     * @returns Company Updated company.
     * @throws ApiError
     */
    public updateCompany(
        companyId: string,
        requestBody: CompanyUpdateRequest,
    ): Observable<Company> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/companies/{companyId}',
            path: {
                'companyId': companyId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002 — never a domain-policy refusal).`,
                403: `Authorization failure (ADR-0002).`,
                404: `No company exists with that ID. Plain resource-lookup miss — ADR-0002's classification test covers domain refusals, not existence lookups, so this uses standard REST semantics rather than the 403/409/422 test.
                `,
                422: `Domain-policy refusal that isn't an identity/version/lifecycle collision (ADR-0002).`,
            },
        });
    }
    /**
     * Deactivate (soft-delete) a company
     * Satisfies REQ-1's "delete" acceptance criterion via ADR-0005's announce-and-flag pattern: sets a deactivation timestamp (the row is never removed) and publishes `company.deactivated` on `company.events.v1`. There is no hard-delete endpoint — ADR-0005 rejects hard-deleting an aggregate other services hold references to.
     *
     * @param companyId
     * @returns void
     * @throws ApiError
     */
    public deactivateCompany(
        companyId: string,
    ): Observable<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/companies/{companyId}',
            path: {
                'companyId': companyId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No company exists with that ID. Plain resource-lookup miss — ADR-0002's classification test covers domain refusals, not existence lookups, so this uses standard REST semantics rather than the 403/409/422 test.
                `,
                409: `The company is already deactivated (lifecycle-status collision, ADR-0002).`,
            },
        });
    }
    /**
     * Reactivate a previously deactivated company
     * Symmetric counterpart to deactivation per ADR-0005: clears the deactivation timestamp and publishes `company.reactivated` on `company.events.v1`.
     *
     * @param companyId
     * @returns Company Reactivated company.
     * @throws ApiError
     */
    public reactivateCompany(
        companyId: string,
    ): Observable<Company> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/companies/{companyId}/reactivate',
            path: {
                'companyId': companyId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No company exists with that ID. Plain resource-lookup miss — ADR-0002's classification test covers domain refusals, not existence lookups, so this uses standard REST semantics rather than the 403/409/422 test.
                `,
                409: `The company is already active (lifecycle-status collision, ADR-0002).`,
            },
        });
    }
}
