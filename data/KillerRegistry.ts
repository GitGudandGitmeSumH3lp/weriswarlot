import { VisualTrait, VISUAL_TRAITS } from './InspectionRegistry';

export interface KillerProfile {
  id: 'psychopath' | 'professional' | 'opportunist';
  crimeVignettes: string[];
  actionCooldown: number;
  heatIncrease: number;
  // CHANGED: Now references the structured Trait objects
  inspectableTraits: VisualTrait[]; 
}

export const KILLER_REGISTRY: KillerProfile[] = [
  {
    id: 'psychopath',
    crimeVignettes: ['crime_stabbing', 'crime_hidden_body'],
    actionCooldown: 45,
    heatIncrease: 20,
    inspectableTraits: [VISUAL_TRAITS['blood_hands'], VISUAL_TRAITS['muddy_shoes']]
  },
  {
    id: 'professional',
    crimeVignettes: ['crime_stash', 'crime_stolen_bag'],
    actionCooldown: 90,
    heatIncrease: 5,
    inspectableTraits: [VISUAL_TRAITS['muddy_shoes']] // Subtle
  },
  {
    id: 'opportunist',
    crimeVignettes: ['herring_art', 'herring_toy'],
    actionCooldown: 60,
    heatIncrease: 10,
    inspectableTraits: [VISUAL_TRAITS['paint_smear'], VISUAL_TRAITS['torn_pocket']]
  }
];

export const getKillerProfile = (id: string): KillerProfile => {
  return KILLER_REGISTRY.find(p => p.id === id) || KILLER_REGISTRY[0];
};