// ... existing interface
export interface KillerProfile {
  id: 'psychopath' | 'professional' | 'opportunist';
  crimeVignettes: string[];
  actionCooldown: number;
  heatIncrease: number;
  // NEW: Keywords that witnesses will use to describe the killer
  visualTraits: string[]; 
}

export const KILLER_REGISTRY: KillerProfile[] = [
  {
    id: 'psychopath',
    crimeVignettes: ['crime_stabbing', 'crime_hidden_body'],
    actionCooldown: 45,
    heatIncrease: 20,
    visualTraits: ['wild hair', 'blood-stained hands', 'a manic expression']
  },
  {
    id: 'professional',
    crimeVignettes: ['crime_stash', 'crime_stolen_bag'],
    actionCooldown: 90,
    heatIncrease: 5,
    visualTraits: ['a clean suit', 'a briefcase', 'expensive shoes']
  },
  {
    id: 'opportunist',
    crimeVignettes: ['herring_art', 'herring_toy'],
    actionCooldown: 60,
    heatIncrease: 10,
    visualTraits: ['a messy apron', 'holding a spray can', 'paint-stained fingers']
  }
];

export const getKillerProfile = (id: string): KillerProfile => {
  return KILLER_REGISTRY.find(p => p.id === id) || KILLER_REGISTRY[0];
};