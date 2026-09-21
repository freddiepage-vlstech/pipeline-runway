/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Stage } from '../models/Stage';
import type { StageCreateRequest } from '../models/StageCreateRequest';
import type { StageUpdateRequest } from '../models/StageUpdateRequest';
import { BaseHttpRequest } from '../core/BaseHttpRequest';
@Injectable({
    providedIn: 'root',
})
export class StagesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List pipeline stages, in display order (REQ-6)
     * @returns Stage Ordered stages.
     * @throws ApiError
     */
    public listStages(): Observable<Array<Stage>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/stages',
            errors: {
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
    /**
     * Define a new stage (REQ-6, admin)
     * @param requestBody
     * @returns Stage Stage created.
     * @throws ApiError
     */
    public createStage(
        requestBody: StageCreateRequest,
    ): Observable<Stage> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/stages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
    /**
     * Rename or reconfigure a stage (REQ-6, admin)
     * @param stageId
     * @param requestBody
     * @returns Stage Updated stage.
     * @throws ApiError
     */
    public updateStage(
        stageId: string,
        requestBody: StageUpdateRequest,
    ): Observable<Stage> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/stages/{stageId}',
            path: {
                'stageId': stageId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
                404: `No opportunity exists with that ID (plain resource-lookup miss, not an ADR-0002 domain refusal).`,
            },
        });
    }
    /**
     * Reorder stages (REQ-6, admin)
     * @param requestBody
     * @returns Stage Stages in their new order.
     * @throws ApiError
     */
    public reorderStages(
        requestBody: {
            orderedStageIds: Array<string>;
        },
    ): Observable<Array<Stage>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/stages/reorder',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request-shape validation failure (ADR-0002).`,
                403: `Authorization failure (ADR-0002).`,
            },
        });
    }
}
