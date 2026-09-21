/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Contact } from '../models/Contact';
import type { ContactCreateRequest } from '../models/ContactCreateRequest';
import type { ContactPage } from '../models/ContactPage';
import type { ContactUpdateRequest } from '../models/ContactUpdateRequest';
import { BaseHttpRequest } from '../core/BaseHttpRequest';
@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List contacts
     * @param companyId Filter to contacts linked to this company.
     * @param search Case-insensitive match against first/last name or email.
     * @param includeInactive
     * @param page
     * @param size
     * @returns ContactPage A page of contacts.
     * @throws ApiError
     */
    public listContacts(
        companyId?: string,
        search?: string,
        includeInactive: boolean = false,
        page?: number,
        size: number = 50,
    ): Observable<ContactPage> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/contacts',
            query: {
                'companyId': companyId,
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
     * Create a contact
     * @param requestBody
     * @returns Contact Contact created.
     * @throws ApiError
     */
    public createContact(
        requestBody: ContactCreateRequest,
    ): Observable<Contact> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/contacts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
                422: `Domain-policy refusal that isn't an identity/version/lifecycle collision (ADR-0002).`,
            },
        });
    }
    /**
     * Get a contact by ID
     * @param contactId
     * @returns Contact The contact.
     * @throws ApiError
     */
    public getContact(
        contactId: string,
    ): Observable<Contact> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/contacts/{contactId}',
            path: {
                'contactId': contactId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No contact exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
            },
        });
    }
    /**
     * Partially update a contact
     * @param contactId
     * @param requestBody
     * @returns Contact Updated contact.
     * @throws ApiError
     */
    public updateContact(
        contactId: string,
        requestBody: ContactUpdateRequest,
    ): Observable<Contact> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/contacts/{contactId}',
            path: {
                'contactId': contactId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
                404: `No contact exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
                422: `Domain-policy refusal that isn't an identity/version/lifecycle collision (ADR-0002).`,
            },
        });
    }
    /**
     * Deactivate (soft-delete) a contact
     * Soft-delete + `contact.deactivated` event on `contact.events.v1`, mirroring companies-service. See this file's top-level description for why this applies to Contact even though REQ-2 doesn't require it explicitly.
     *
     * @param contactId
     * @returns void
     * @throws ApiError
     */
    public deactivateContact(
        contactId: string,
    ): Observable<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/contacts/{contactId}',
            path: {
                'contactId': contactId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No contact exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
                409: `The contact is already deactivated (lifecycle-status collision, ADR-0002).`,
            },
        });
    }
    /**
     * Reactivate a previously deactivated contact
     * @param contactId
     * @returns Contact Reactivated contact.
     * @throws ApiError
     */
    public reactivateContact(
        contactId: string,
    ): Observable<Contact> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/contacts/{contactId}/reactivate',
            path: {
                'contactId': contactId,
            },
            errors: {
                403: `Authorization failure (ADR-0002).`,
                404: `No contact exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
                409: `The contact is already active (lifecycle-status collision, ADR-0002).`,
            },
        });
    }
}
