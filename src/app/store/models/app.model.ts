import { PeopleState } from './population.model';
import { miner, People, Process, villager } from './processes.model';
import { Resources } from './resource.model';

export type BuildingLevelState = {
  housing: number;
  farming: number;
  mine: number;
  farmerTraining: number;
  minerTraining: number;
};

export type AppState = {
  username: string;
  resources: Resources;
  buildingLevelState: BuildingLevelState;
  error: string | null;
  population: {
    readonly [key in People]: PeopleState;
  };
  processes: Process[];
  // consumingRewardingMap: any;
};

export const initialResourceState: Resources = {
  wood: 10,
  stone: 10,
  food: 20,
};

export const initialBuildingsState: BuildingLevelState = {
  housing: 1,
  farming: 0,
  mine: 0,
  farmerTraining: 0,
  minerTraining: 0,
};

export const initialPopulationState = {
  villager: { available: 1, occupied: 0, acquiring: 0 },
  farmer: { available: 0, occupied: 0, acquiring: 0 },
  hunter: { available: 0, occupied: 0, acquiring: 0 },
  miner: { available: 0, occupied: 0, acquiring: 0 },
};

export const initialState: AppState = {
  username: '',
  resources: initialResourceState,
  buildingLevelState: initialBuildingsState,
  population: initialPopulationState,
  processes: [],
  error: null,
};
