# Civilian AI System
**System:** WorldSimulation
**Related Files:** `systems/gameplay/CivilianSystem.ts`, `utils/WorldGenerator.ts`, `data/Constants.ts`

## 1. Overview
The Civilian System provides "Visual Noise" to camouflage the Killer. By keeping the screen full of moving targets, it prevents the player from simply clicking on the only moving object.

## 2. Movement Logic
The AI uses a stateless "Target-Seek" behavior loop managed by `CivilianSystem.ts`.

### The Loop
1.  **Assign Target:** On spawn, every actor is given a random `targetX/Y` from the `spawns.safe` list (Lampposts, Intersections).
2.  **Move:** The actor moves at a base speed (`0.5` pixels/frame) toward the target.
3.  **Arrival:** When distance < 5px:
    *   **Wait:** Assign a random `waitTimer` (2.0s - 5.0s).
    *   **Retarget:** Pick a new random Safe Zone.
4.  **Repeat.**

## 3. Heat Response (The Panic Bridge)
Civilians subscribe to the `killerHeat` metric from the global store. Their behavior changes based on thresholds defined in `Constants.ts`.

| Heat Level | State | Speed Mod | Behavior Change |
| :--- | :--- | :--- | :--- |
| **0 - 29** | **Calm** | 1.0x | Standard Wander behavior. |
| **30 - 69** | **Nervous** | 1.5x | Faster walking. Reduced wait times (0.5s - 2.0s). |
| **70 - 100** | **Panic** | 2.5x | **Flee State.** Actors stop wandering and run to map `exits`. Once at an exit, they cower (long wait). |

## 4. The Killer's Camouflage
The Killer (`type: 'killer'`) is currently excluded from this system to allow for custom behavior (e.g., Stalking).
*   **Current State:** The Killer mimics civilian spawning but remains static or has their own separate logic (pending expansion).