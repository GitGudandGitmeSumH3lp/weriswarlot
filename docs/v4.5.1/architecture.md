# STATE DUMP (Architecture Only)

# START OF FILE docs/ARCHITECTURE.md
# WERISWARLOT Architecture Blueprint
**Version:** 4.5.1
**Last Updated:** January 2, 2026

## 1. High-Level Overview
WERISWARLOT is a forensic simulation game built on a hybrid architecture that separates **Game Logic** (pure TypeScript) from the **View Layer** (React + PixiJS).

### Core Philosophy: "The Visual Rhyme"
The game does not use random prop scattering. It uses **Vignettes**—clusters of items that tell a micro-story.
*   **The Signal:** Actual evidence (e.g., Blood Stain).
*   **The Noise:** Visual look-alikes (e.g., Ketchup Stain, Red Paint).
*   **The Context:** The surrounding items (Hotdog Wrapper vs. Paint Brush) determine the truth.

---

## 2. System Architecture

### A. The Data Flow (Generation -> Rendering)
The world is generated *once* per level in `World.tsx` and passed down as pure data arrays. The View Layer is "dumb"—it simply renders what it is told.

```mermaid
graph TD
    A[GameStore (Level State)] -->|Level #| B[World.tsx (Orchestrator)]
    B -->|Calls| C[CityGenerator (Layout)]
    B -->|Calls| D[WorldGenerator (Entities)]
    C & D -->|Returns Data| B
    B -->|Passes Props| E[SceneLayer (Renderer)]
    E -->|Lookups| F[Painters (Visual Assets)]
    F -->|Draws to| G[PixiJS Canvas]
```

### B. The Interaction Flow (Click -> Logic)
When a player clicks an object, the View Layer passes a generic event up to the Logic Layer. The Logic Layer processes it and updates the Store.

```mermaid
graph TD
    A[User Click] -->|onInteract(entity)| B[World.tsx]
    B -->|Snapshots State| C[GameContext]
    C -->|Passed to| D[InteractionRouter]
    D -->|Priority Check| E{System Router}
    E -->|High Priority| F[CrisisSystem (Bombs)]
    E -->|Med Priority| G[DialogueSystem (NPCs)]
    E -->|Low Priority| H[EvidenceSystem (Clues)]
    H -->|Calculate Score| I[GameStore]
    I -->|Update UI| J[GameHUD (React)]
```

---

## 3. Key Subsystems

### The Generator Stack
*   **`CityGenerator.ts`:** Creates the physical layout (Walls, Water, Paths) and defines `safe`/`danger` spawn zones.
*   **`WorldGenerator.ts`:** Populates the city.
    *   **Actors:** Spawns NPCs using the Roster System (96 unique visual variants).
    *   **Vignettes:** Scans the grid context (`PARK`, `ALLEY`, `PATH`) and places narrative clusters from `VignetteRegistry`.

### The Visual Stack
*   **`SceneLayer.tsx`:** The main renderer. Handles Z-Sorting (depth) and Terrain rendering.
*   **`CharacterPainters.ts`:** Procedurally draws characters based on seed values (Skin, Hair, Clothes).
*   **`PropPainters.ts`:** Draws environmental objects.
*   **`GameHUD.tsx`:** The HTML overlay for UI (Evidence Bag, "Begin Simulation" button).

### The Logic Stack
*   **`InteractionRouter.ts`:** The entry point for all clicks.
*   **`EvidenceSystem.ts`:** Determines if an item is `CRIME`, `HERRING`, or `AMBIANCE` and updates the `convictionScore`.
*   **`KillerSystem.ts`:** A React Hook "Heartbeat" that triggers dynamic "Planting" of new vignettes over time.
*   **`CivilianSystem.ts`:** A React Hook managing NPC movement AI for camouflage.

---

## 4. Directory Structure Map

| Directory | Purpose | Key Files |
| :--- | :--- | :--- |
| `src/components/game/` | The Root View | `World.tsx` (Orchestrator), `layers/SceneLayer.tsx` (Renderer) |
| `src/components/ui/` | The HTML Overlay | `GameHUD.tsx` |
| `src/systems/gameplay/` | The Brains | `InteractionRouter.ts`, `KillerSystem.ts`, `CivilianSystem.ts` |
| `src/utils/` | The Tools | `WorldGenerator.ts`, `VignetteRegistry.ts`, `*Painters.ts` |
| `src/store/` | The State | `gameStore.ts` (Zustand) |
| `src/data/` | The Constants | `Constants.ts`, `KillerRegistry.ts` |

---

## 5. Development Rules (The "Gotchas")

1.  **Registry Hydration:** In `World.tsx`, the `textureRegistry` loop MUST map `base_key` to `base_key_0`...`base_key_5`. Without this, characters will render as blue boxes.
2.  **Context Injection:** Never use `useGameStore` hooks inside the Systems (`src/systems/`). Always pass the state via the `GameContext` object from `World.tsx`.
3.  **Pixi Context:** Hooks like `useTick` must be called in a component *inside* the `<Application>` tree (e.g., `SceneLayer`), not alongside it (`World`).
# END OF FILE docs/ARCHITECTURE.md