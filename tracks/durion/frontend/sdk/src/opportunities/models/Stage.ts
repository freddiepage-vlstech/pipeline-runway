/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Stage = {
    readonly id: string;
    name: string;
    /**
     * 0-based display/kanban-column order.
     */
    order: number;
    /**
     * Drives REQ-9's automation. Exactly one stage should normally have this true.
     */
    isClosedWon: boolean;
    /**
     * Marks the stage as terminal, same as isClosedWon, without triggering REQ-9's event.
     */
    isClosedLost: boolean;
};

