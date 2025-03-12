export const gatheringTypes = ['wood', 'food', 'stone'] as const;
export const buildingTypes = ['house', 'farm', 'mine'] as const;
export type GatheringType = (typeof gatheringTypes)[number];
export type BuildingType = (typeof buildingTypes)[number];
export type ProcessType = BuildingType | GatheringType;

export type Process = {
    id: string;
    type: ProcessType;
    amount: number | undefined;
    startTime: number;
    endTime: number;
    completed: boolean;
}

export function isBuilding(processType: ProcessType) : processType is BuildingType {
    return buildingTypes.includes(processType as BuildingType);
}

export function isGathering(processType: ProcessType) : processType is GatheringType{
    return gatheringTypes.includes(processType as GatheringType);
}

export type ProcessState = {
    activeProcesses: Process[];
}

export const initialProcessesState: ProcessState = {
    activeProcesses: []
};
