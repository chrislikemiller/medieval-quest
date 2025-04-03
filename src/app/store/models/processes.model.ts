export const villagerGatherWood = 'villagerGatherWood';
export const villagerGatherFood = 'villagerGatherFood';
export const villagerGatherStone = 'villagerGatherStone';

export const upgradeHousing = 'upgradeHousing';
export const buildFarm = 'buildFarm';
export const buildMine = 'buildMine';
export const buildHuntingGrounds = 'buildHuntingGrounds';

export const buildFarmerTraining = 'buildFarmerTraining';
export const buildMinerTraining = 'buildMinerTraining';
export const buildHunterTraining = 'buildHunterTraining';

export const villager = 'villager';
export const farmer = 'farmer';
export const miner = 'miner';
export const hunter = 'hunter';

export const farmerFarmsFood = 'farmerFarmsFood';

export const minerMinesStone = 'minerMinesStone';
export const minerMinesIronOre = 'minerMinesIronOre';

export const hunterHuntsForHide = 'hunterHuntsForHide';
export const hunterHuntsForFood = 'hunterHuntsForFood';

export const gatheringTypes = [
  villagerGatherWood,
  villagerGatherFood,
  villagerGatherStone,
] as const;
export const gatheringBuildingTypes = [buildFarm, buildMine] as const;
export const trainingBuildingTypes = [
  buildFarmerTraining,
  buildMinerTraining,
  buildHunterTraining,
];
export const specializedVillagers = [farmer, hunter, miner];
export const miningTypes = [minerMinesStone, minerMinesIronOre];
export const huntingTypes = [hunterHuntsForHide, hunterHuntsForFood];

export type Villager = typeof villager;
export type HousingUpgrading = typeof upgradeHousing;
export type VillagerGathering = (typeof gatheringTypes)[number];
export type GatheringBuilding = (typeof gatheringBuildingTypes)[number];
export type TrainingBuilding = (typeof trainingBuildingTypes)[number];
export type SpecializedVillager = (typeof specializedVillagers)[number];
export type Farming = typeof farmerFarmsFood;
export type Mining = (typeof miningTypes)[number];
export type Hunting = (typeof huntingTypes)[number];

export type People = Villager | SpecializedVillager;

export type BuildingTypes = GatheringBuilding | TrainingBuilding; // + processing building

export type SpecializedActivityType = Farming | Hunting | Mining;

export type ProcessType =
  | HousingUpgrading
  | VillagerGathering
  | People
  | BuildingTypes
  | SpecializedActivityType;

export type Process = {
  id: string;
  processType: ProcessType;
  startTime: number;
  endTime: number;
  completed: boolean;
};

export function isBuildingProcess(processType: ProcessType) {
  return gatheringBuildingTypes.includes(processType as GatheringBuilding);
}

export function isGatheringProcess(processType: ProcessType) {
  return gatheringTypes.includes(processType as VillagerGathering);
}

export function isPopulationProcess(processType: ProcessType) {
  return specializedVillagers.includes(processType as SpecializedVillager);
}
