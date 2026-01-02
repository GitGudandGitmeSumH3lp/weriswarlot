# Killer AI System
**System:** GameplayLoop
**Related Files:** `systems/gameplay/KillerSystem.ts`, `data/KillerRegistry.ts`, `store/gameStore.ts`

## 1. Overview
The Killer System creates an active threat in the simulation. Unlike static clues, the Killer changes the world state over time, forcing the player to balance careful investigation with speed.

## 2. Killer Archetypes
The killer's behavior is defined by their profile in `KillerRegistry.ts`.

| Archetype | Cooldown | Heat Gen | Behavior Profile |
| :--- | :--- | :--- | :--- |
| **Psychopath** | 45s | High (+20) | Aggressive. Spawns high-visibility, violent vignettes. Rapidly causes civilian panic. |
| **Professional** | 90s | Low (+5) | Stealthy. Spawns subtle clues. Keeps heat low to avoid alerting the crowd. |
| **Opportunist** | 60s | Med (+10) | Chaotic. Starts by planting Red Herrings. |

## 3. The "Heartbeat" Timer
*   **Logic:** `KillerSystem.ts` (React Hook) -> `gameStore.ts` (State).
*   **Mechanism:**
    1.  Timer starts at 60s.
    2.  Ticks down every second while `gameState === 'PLAYING'`.
    3.  **At Zero:** Triggers an **Anomaly Event** and resets based on `actionCooldown`.

## 4. Anomaly Events ("Planting")
When the timer hits zero, the Killer performs an action:
1.  **Select Crime:** Picks a specific vignette ID from their `crimeVignettes` list.
2.  **Select Location:** `World.tsx` selects a random **Danger Zone** (blind spot) from the City Layout.
3.  **Spawn:** The `spawnVignette` utility injects new props/decals into the live world.
4.  **Feedback:** The UI logs: `SYSTEM: ANOMALOUS ENERGY DETECTED`.

## 5. Heat Mechanic
*   **Metric:** `killerHeat` (0-100).
*   **Growth:** Increases with every action.
*   **Feedback Loop:** Connected to the `CivilianSystem`. High heat causes the crowd to visually panic and flee, making the environment chaotic and harder to navigate.