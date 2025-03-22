export type Population = {
    villagers: number;
    willBeVillagers: number;
    farmers: number;
    miners: number;
    hunters: number;
}

export function totalPopulation(pop: Population) {
    return pop.villagers + pop.willBeVillagers + pop.farmers + pop.hunters;
}

