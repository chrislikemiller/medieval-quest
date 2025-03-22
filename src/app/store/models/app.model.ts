import { Population } from "./population.model";
import { ProcessState } from "./processes.model";
import { Resources } from "./resource.model";

export type AppState = {
    username: string;
    resources: Resources;
    error: string | null;
    houses: number;
    population: Population;
    processes: ProcessState
}

export const initialResourceState: Resources = {
    wood: 10,
    stone: 10,
    food: 20
};

export const initialPopulationState: Population = {
    villagers: 2,
    willBeVillagers: 0,
    farmers: 0,
    miners: 0,
    hunters: 0
};

export const initialProcessesState: ProcessState = {
    activeProcesses: []
};

export const initialState: AppState = {
    username: "",
    resources: initialResourceState,
    population: initialPopulationState,
    processes: initialProcessesState,
    error: null,
    houses: 5,
};
