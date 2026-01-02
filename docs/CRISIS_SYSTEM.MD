# Crisis System (The Mercy Path)
**System:** Climax
**Related Files:** `CrisisSystem.ts`, `CrisisOverlay.tsx`, `gameStore.ts`

## 1. Trigger
The Crisis is triggered if the player chooses the **SAVE** (Mercy) option during the Confrontation phase.

## 2. Global Timer
*   **Duration:** 30 Seconds.
*   **Visual:** Large red countdown at top-center.
*   **Failure:** State transitions to `GAME_OVER` (Casualties: +5) if timer hits 0.

## 3. Scenarios

### A. The Bomb Scenario
*   **Interactable:** `prop_bomb`
*   **Mechanism:** Opens the Wire Cutting UI.
*   **Puzzle:** 3 Wires (Red, Blue, Green). 
*   **Logic:** A random "Safe Wire" is decided on level start. Cutting the correct wire wins; cutting any other triggers an immediate explosion.

### B. The Poison Scenario
*   **Interactable:** `prop_bottle_0` (Red), `_1` (Blue), `_2` (Green).
*   **Mechanism:** Interaction is performed directly in the overworld.
*   **Logic:** Player must click the bottle matching the `crisisSolution` stored in the game state.