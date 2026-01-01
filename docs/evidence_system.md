# Evidence & Investigation System
**System:** GameplayLoop
**Related Files:** `systems/gameplay/EvidenceSystem.ts`, `store/gameStore.ts`, `utils/VignetteRegistry.ts`

## 1. Core Concept: "The Visual Rhyme"
WERISWARLOT is not a pixel-hunting game; it is a context-association game. The difficulty comes from distinguishing **Evidence** from **Red Herrings** that visually resemble evidence.

*   **The Signal:** A generic red stain is blood **IF** a weapon is nearby.
*   **The Noise:** A generic red stain is ketchup **IF** a hotdog wrapper is nearby.
*   **The Mechanic:** The player must observe the *surrounding props* (the Vignette) before clicking the item to log it.

---

## 2. Evidence Qualities
Every interactive object in the world has a `quality` tag derived from its Vignette definition.

| Quality Tag | Gameplay Role | Visual Example |
| :--- | :--- | :--- |
| **CRIME** | **The Signal.** Valid proof of guilt. Increases Case Strength. | Blood Stain, Knife, Stolen Wallet. |
| **HERRING** | **The Noise.** Misleading clutter. Penalizes the player. | Ketchup, Red Paint, Toy Gun. |
| **AMBIANCE** | **The Context.** Neutral props that tell the story. Safe to click but useless. | Picnic Basket, Park Bench, Trees. |

---

## 3. Scoring Mathematics
The `convictionScore` (0-100%) represents the strength of the case against the suspect.

**Base Logic (`gameStore.ts`):**
*   **Start:** 15% (Rumor/Hunch)
*   **Log CRIME:** **+20%**
    *   *Feedback:* "SOLID EVIDENCE. Case strength increased."
*   **Log HERRING:** **-10%**
    *   *Feedback:* "USELESS JUNK. The DA will not like this."
*   **Log AMBIANCE:** **+0%**
    *   *Feedback:* "Just clutter."

**Win Condition:**
The player must reach **70% Conviction Score** to unlock the **Arrest** option during the Confrontation Phase.

---

## 4. The Interaction Pipeline
When a player clicks an object, the following chain executes:

1.  **Click Event:** `SceneLayer` detects click on `<Graphics>`.
2.  **Routing:** `InteractionRouter` receives the entity data.
3.  **Filtering:**
    *   If `CrisisSystem` (Bomb) is active, it takes priority.
    *   If `DialogueSystem` (NPC) is relevant, it triggers.
    *   Otherwise, pass to `EvidenceSystem`.
4.  **Processing:** `EvidenceSystem` checks the item's `quality` tag.
5.  **Storage:**
    *   Calls `store.logEvidence(id, texture, quality)`.
    *   If the item is unique (not already in bag), it is added to the `evidenceBag` array.
    *   Score is updated immediately.

---

## 5. The Evidence Bag
The UI displays the collected evidence.
*   **Capacity:** Max 5 items per level.
*   **Strategy:** Players must be selective. Clicking random objects fills the bag with "Junk" (Herrings) or "Clutter" (Ambiance), preventing collection of real evidence.

---

## 6. Adding New Evidence
To create a new puzzle:
1.  **Visuals:** Draw the assets in `PropPainters.ts`.
2.  **Logic:** Define a Vignette in `VignetteRegistry.ts`.
    *   Tag the true clue as `quality: 'CRIME'`.
    *   Tag the misleading clue as `quality: 'HERRING'`.
    *   Tag the context props as `quality: 'AMBIANCE'` (default).