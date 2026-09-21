/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OpportunitySummary = {
    byStage: Array<{
        stageId: string;
        stageName: string;
        totalAmount: number;
        count: number;
    }>;
    /**
     * Sum of amount across every open (non-closed) stage.
     */
    totalOpenValue: number;
};

