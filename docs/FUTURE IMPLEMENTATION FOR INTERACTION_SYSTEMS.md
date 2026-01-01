# Interaction Systems (Crisis & Dialogue)
**System:** InteractionLoop
**Status:** Specification / Partial Implementation
**Related Files:** `InteractionRouter.ts`, `CrisisSystem.ts` (Pending), `DialogueSystem.ts` (Pending)

## 1. The Interaction Priority Stack
In `InteractionRouter.ts`, clicks are processed in a strict order. This ensures that if a Bomb is ticking, the game prioritizes defusing it over picking up a nearby clue.

1.  **CRISIS (Priority 1):** Active only during `SCENARIO_ACTIVE`. Handles bombs, antidotes, and rescue mechanics.
2.  **DIALOGUE (Priority 2):** Handles clicking on Actors (NPCs). Provides testimonial clues.
3.  **EVIDENCE (Priority 3):** Handles static props. The default investigation loop.

---

## 2. The Dialogue System (NPCs)
**Goal:** Provide clues about the `killerArchetype` to guide the player's investigation.

### Logic Flow
1.  **Trigger:** User clicks an entity with `type: 'civilian' | 'killer'`.
2.  **Check:** Is the specific Actor the Killer?
    *   **If Killer:** Low chance to slip up ("I... I didn't do it!"), high chance to deflect.
    *   **If Civilian:** Provides a randomly selected "Rumor" from a text bank.
3.  **Output:** Pushes a message to the `feed` with source `VOICE`.
    *   *Example:* "VOICE: 'I saw someone with **Neon Hair** running south!'" (Hints at 'Punk' archetype).

---

## 3. The Crisis System (Scenarios)
**Goal:** A high-intensity mini-game triggered by the "Mercy" choice in the Confrontation phase.

### State Activation
*   **Trigger:** `gameState` enters `SCENARIO_ACTIVE`.
*   **Timer:** `gameStore.scenarioTimer` begins counting down (e.g., 30s).

### Scenario Types
The logic depends on `activeScenario` in the store:

#### A. BOMB Scenario
*   **Visuals:** A specific prop (`prop_bomb`) becomes interactive.
*   **Interaction:** Clicking the bomb opens a "Cut Wire" choice.
    *   *Correct:* `completeLevel(true)` (Victims Saved).
    *   *Incorrect:* `failScenario(5)` (Explosion, +5 Victims).

#### B. POISON Scenario
*   **Visuals:** Several "Bottle" props appear or become highlighted.
*   **Puzzle:** Player must find the bottle tagged `quality: 'ANTIDOTE'` amidst `HERRING` bottles.
*   **Interaction:** Clicking the correct bottle stops the timer.

#### C. ACCOMPLICE Scenario
*   **Visuals:** A specific NPC tries to flee (moves toward map edge).
*   **Interaction:** Player must click the moving target before they leave the screen coordinates.

---

## 4. Integration with View Layer
*   **Visuals:** These systems rely on the existing `SceneLayer`.
*   **Feedback:** All outcomes (Success/Fail/Info) are routed through `store.postFeed()`.# Interaction Systems (Crisis & Dialogue)
**System:** InteractionLoop
**Status:** Specification / Partial Implementation
**Related Files:** `InteractionRouter.ts`, `CrisisSystem.ts` (Pending), `DialogueSystem.ts` (Pending)

## 1. The Interaction Priority Stack
In `InteractionRouter.ts`, clicks are processed in a strict order. This ensures that if a Bomb is ticking, the game prioritizes defusing it over picking up a nearby clue.

1.  **CRISIS (Priority 1):** Active only during `SCENARIO_ACTIVE`. Handles bombs, antidotes, and rescue mechanics.
2.  **DIALOGUE (Priority 2):** Handles clicking on Actors (NPCs). Provides testimonial clues.
3.  **EVIDENCE (Priority 3):** Handles static props. The default investigation loop.

---

## 2. The Dialogue System (NPCs)
**Goal:** Provide clues about the `killerArchetype` to guide the player's investigation.

### Logic Flow
1.  **Trigger:** User clicks an entity with `type: 'civilian' | 'killer'`.
2.  **Check:** Is the specific Actor the Killer?
    *   **If Killer:** Low chance to slip up ("I... I didn't do it!"), high chance to deflect.
    *   **If Civilian:** Provides a randomly selected "Rumor" from a text bank.
3.  **Output:** Pushes a message to the `feed` with source `VOICE`.
    *   *Example:* "VOICE: 'I saw someone with **Neon Hair** running south!'" (Hints at 'Punk' archetype).

---

## 3. The Crisis System (Scenarios)
**Goal:** A high-intensity mini-game triggered by the "Mercy" choice in the Confrontation phase.

### State Activation
*   **Trigger:** `gameState` enters `SCENARIO_ACTIVE`.
*   **Timer:** `gameStore.scenarioTimer` begins counting down (e.g., 30s).

### Scenario Types
The logic depends on `activeScenario` in the store:

#### A. BOMB Scenario
*   **Visuals:** A specific prop (`prop_bomb`) becomes interactive.
*   **Interaction:** Clicking the bomb opens a "Cut Wire" choice.
    *   *Correct:* `completeLevel(true)` (Victims Saved).
    *   *Incorrect:* `failScenario(5)` (Explosion, +5 Victims).

#### B. POISON Scenario
*   **Visuals:** Several "Bottle" props appear or become highlighted.
*   **Puzzle:** Player must find the bottle tagged `quality: 'ANTIDOTE'` amidst `HERRING` bottles.
*   **Interaction:** Clicking the correct bottle stops the timer.

#### C. ACCOMPLICE Scenario
*   **Visuals:** A specific NPC tries to flee (moves toward map edge).
*   **Interaction:** Player must click the moving target before they leave the screen coordinates.

---

## 4. Integration with View Layer
*   **Visuals:** These systems rely on the existing `SceneLayer`.
*   **Feedback:** All outcomes (Success/Fail/Info) are routed through `store.postFeed()`.