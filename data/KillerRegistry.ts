/**
 * @file KillerRegistry.ts
 * @description Defines the profiles for different killer archetypes.
 * This is the central data source for the KillerSystem.
 */

export interface KillerProfile {
  /** Unique identifier for the archetype */
  id: 'psychopath' | 'professional' | 'opportunist';
  /** List of vignette IDs this killer can spawn */
  crimeVignettes: string[];
  /** Time in seconds between actions */
  actionCooldown: number;
  /** How much "heat" this killer generates per action */
  heatIncrease: number;
}

export const KILLER_REGISTRY: KillerProfile[] = [
  {
    id: 'psychopath',
    crimeVignettes: ['crime_stabbing', 'crime_hidden_body'],
    actionCooldown: 45,
    heatIncrease: 20,
  },
  {
    id: 'professional',
    crimeVignettes: ['crime_stash', 'crime_stolen_bag'],
    actionCooldown: 90,
    heatIncrease: 5,
  },
  {
    id: 'opportunist',
    crimeVignettes: ['herring_art', 'herring_toy'], // Starts by creating distractions
    actionCooldown: 60,
    heatIncrease: 10,
  }
];

/**
 * Utility to get a killer's profile by their ID.
 * @param id The archetype ID (e.g., 'psychopath')
 * @returns The killer's profile or the first profile as a fallback.
 */
export const getKillerProfile = (id: string): KillerProfile => {
  return KILLER_REGISTRY.find(p => p.id === id) || KILLER_REGISTRY[0];
};