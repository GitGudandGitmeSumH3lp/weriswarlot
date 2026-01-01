# Civilian AI System
**System:** WorldSimulation
**Related Files:** `systems/gameplay/CivilianSystem.ts`, `utils/WorldGenerator.ts`

## 1. Overview
The Civilian System provides "Visual Noise" to camouflage the Killer. By keeping the screen full of moving targets, it prevents the player from simply clicking on the only moving object.

## 2. Movement Logic
The AI uses a stateless "Target-Seek" behavior loop managed by `CivilianSystem.ts`.

### The Loop
1.  **Assign Target:** On spawn, every actor is given a random `targetX/Y` from the `spawns.safe` list (Lampposts, Intersections).
2.  **Move:** The actor moves at `0.5` pixels/frame toward the target.
3.  **Arrival:** When distance < 5px:
    *   **Wait:** Assign a random `waitTimer` (2.0s - 5.0s).
    *   **Retarget:** Pick a new random Safe Zone.
4.  **Repeat.**

## 3. The Killer's Camouflage
The Killer (`type: 'killer'`) is currently excluded from this system to allow for custom behavior in the future (e.g., Stalking).
*   **Current State:** The Killer mimics civilian spawning but remains static or has their own separate logic (pending expansion).