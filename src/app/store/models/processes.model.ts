import { Resources } from './resource.model';

export const villagerGatherWood = 'villagerGatherWood';
export const villagerGatherFood = 'villagerGatherFood';
export const villagerGatherStone = 'villagerGatherStone';

export const buildHouse = 'buildHouse';
export const buildFarm = 'buildFarm';
export const buildMine = 'buildMine';

export const recruitVillager = 'recruitVillager';
export const trainFarmer = 'trainFarmer';
export const trainHunter= 'trainHunter';
export const trainMiner = 'trainMiner';

export const gatheringTypes = [
  villagerGatherWood,
  villagerGatherFood,
  villagerGatherStone,
] as const;

export const buildingTypes = [buildHouse, buildFarm, buildMine] as const;

export const personTypes = [recruitVillager, trainFarmer, trainHunter, trainMiner] as const;

export type VillagerGatheringType = (typeof gatheringTypes)[number];
export type BuildingType = (typeof buildingTypes)[number];
export type PersonType = (typeof personTypes)[number];
export type ProcessType = VillagerGatheringType | BuildingType | PersonType;

export type ProcessOptions =
  | { type: VillagerGatheringType; amount: number; occupiedVillager: number }
  | { type: BuildingType; consumedMaterials: Partial<Resources> }
  | {
      type: PersonType;
      consumedMaterials: Partial<Resources>;
      trainedVillager: number;
    };

export type Process = {
  id: string;
  options: ProcessOptions;
  startTime: number;
  endTime: number;
  completed: boolean;
};

export function isBuildingProcess(
  options: ProcessOptions
): options is { type: BuildingType; consumedMaterials: Partial<Resources> } {
  return buildingTypes.includes(options.type as BuildingType);
}

export function isGatheringProcess(options: ProcessOptions): options is {
  type: VillagerGatheringType;
  amount: number;
  occupiedVillager: number;
} {
  return gatheringTypes.includes(options.type as VillagerGatheringType);
}

export function isPopulationProcess(options: ProcessOptions): options is {
  type: PersonType;
  consumedMaterials: Partial<Resources>;
  trainedVillager: number;
} {
  return personTypes.includes(options.type as PersonType);
}

export type ProcessState = {
  activeProcesses: Process[];
};
