# Game State & Logic Manual
**System:** StateMachine
**Related Files:** `store/gameStore.ts`

## 1. The Global State Machine
The game logic is driven by the `gameState` variable in the Zustand store.

| State | Description | Triggers |
| :--- | :--- | :--- |
| **IDLE** | Game is loaded but paused. Main Menu is visible. | App Start, `nextLevel()` |
| **PLAYING** | Main investigation phase. Player interacts with world. | `startGame()` |
| **CONFRONTATION** | Investigation paused. Player chooses Arrest vs Mercy. | `triggerConfrontation()` (Requires Score > 70%) |
| **SCENARIO_ACTIVE** | Timed event (Bomb/Rescue). Ticking clock active. | `resolveConfrontation('SAVE')` |
| **LEVEL_COMPLETE** | Success screen. Score tally. | `resolveConfrontation('ARREST')` (Success) or Scenario Win |
| **GAME_OVER** | Failure screen. Permadeath or restart. | `failScenario()`, `resolveConfrontation` (Fail) |

---

## 2. Core Metrics

### Conviction Score
*   **Range:** 0% to 100%.
*   **Start:** 15% (Base Suspicion).
*   **Threshold:** Must be **≥ 70%** to trigger Confrontation.
*   **Modifiers:**
    *   `+20%`: Valid `CRIME` evidence.
    *   `-10%`: Invalid `HERRING` object.

### Victim Count
*   **Role:** The failure metric.
*   **Increases:** When a Scenario fails (Bomb explodes = +5 victims) or a botched arrest occurs.

---

## 3. The Feed System (UI Feedback)
The `feed` is a rolling log of the last 4 system messages. It replaces standard alerts to maintain immersion.

### Message Sources
| Source | Context | Example Text |
| :--- | :--- | :--- |
| **SYSTEM** | Meta-game events. | "CONNECTION ESTABLISHED." |
| **ANALYSIS** | Evidence interaction. | "SOLID EVIDENCE. Case strength increased." |
| **ERROR** | Negative feedback. | "EVIDENCE BAG FULL." |
| **VOICE** | NPC Dialogue (Placeholder). | "I didn't see anything!" |

---

## 4. Win/Loss Logic

### The Arrest Gamble
When the player chooses **ARREST** during Confrontation:
1.  System generates a random roll (0-100).
2.  **Success:** If `Roll < ConvictionScore`. The killer is caught. State -> `LEVEL_COMPLETE`.
3.  **Failure:** The killer escapes or attacks. State -> `GAME_OVER` or `SCENARIO_ACTIVE` (depending on active archetype).

### The Mercy Path
When the player chooses **SAVE/MERCY**:
1.  State -> `SCENARIO_ACTIVE`.
2.  Timer starts (e.g., 30 seconds).
3.  Player must interact with specific props (e.g., "Cut Blue Wire") to resolve the crisis.