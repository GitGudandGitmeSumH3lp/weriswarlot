### Phase 3: Implementation (Documentation - Step 2)

I have generated the **Spawning System Manual**. This document details the algorithmic logic behind where actors walk and where clues appear. It is crucial for understanding why the world looks the way it does.

**Action:** Create the file `docs/SPAWNING_SYSTEM.md`.

```markdown
# Spawning & World Generation System
**System:** WorldGen
**Related Files:** `utils/CityGenerator.ts`, `utils/WorldGenerator.ts`, `utils/TerrainFactory.ts`

## 1. Overview
WERISWARLOT uses a **Hybrid Spawning Architecture**:
1.  **Static Coordinate Lists:** Used for moving entities (Actors, Killer).
2.  **Dynamic Grid Analysis:** Used for static environmental storytelling (Vignettes, Props).

This hybrid approach ensures actors always spawn in walkable areas, while props organically adapt to the terrain geometry (e.g., crime scenes appearing in alleys).

---

## 2. The Terrain Foundation
The world is built on a 25x19 grid (800x600px / 32px tiles). The `TerrainFactory` generates the base layer using **Tile Types**.

| TileType | ID | Properties | Spawning Context |
| :--- | :--- | :--- | :--- |
| **GRASS** | 0 | Walkable | Becomes `PARK` context. |
| **DIRT** | 1 | Walkable | Becomes `PATH` context. |
| **WATER** | 2 | **Solid** | No spawning allowed. |
| **WALL** | 3 | **Solid** | No spawning. Neighbors become `ALLEY`. |

---

## 3. Static Zones (Actor Spawning)
**File:** `CityGenerator.ts`

The `CityGenerator` manually defines specific "Points of Interest" coordinates based on the layout logic.

### A. Safe Zones (`spawns.safe`)
*   **Definition:** Locations near lampposts, main path intersections, and open grass.
*   **Usage:**
    *   **Civilians:** Pick a random Safe Zone start point.
    *   **The Killer:** Mimics a civilian spawn to blend in.
*   **Jitter:** All spawns apply a `±10px` random offset to prevent Sprite stacking.

### B. Danger Zones (`spawns.danger`)
*   **Definition:** Locations in blind spots, behind tree lines, or in "fog of war" areas.
*   **Usage:**
    *   Anchors for high-suspicion procedural clusters (e.g., Graves, Bodies).

---

## 4. Dynamic Context (Prop Spawning)
**File:** `WorldGenerator.ts`

Instead of placing every trash can manually, the system scans the grid to infer the "vibe" of a tile.

### The Algorithm
1.  **Iterate:** Loop through every cell `[x][y]` in the grid.
2.  **Filter:** Skip if the tile is Solid (`WATER`, `WALL`) or already occupied by a Static Prop (Tree).
3.  **Infer Context:**
    *   If tile is `GRASS` → **Context = PARK**
    *   If tile is `DIRT` → **Context = PATH**
    *   If any neighbor is `WALL` → **Context = ALLEY** (Overrides others)
4.  **Query Registry:** Fetch all Vignettes from `VignetteRegistry` that match the current Context.
5.  **Roll Probability:**
    *   **Density:** 40% chance (`0.40`) to spawn *something* on a valid tile.
    *   **Type Weight:** 10% Crime, 30% Red Herring, 60% Ambiance.

### Example Scenarios
*   **Scenario A:** The scanner finds a `DIRT` tile. Context is `PATH`. It spawns an **Ice Cream Cart**.
*   **Scenario B:** The scanner finds a `GRASS` tile next to a `WALL` (Tree). Context becomes `ALLEY`. It spawns a **Hidden Stash**.

---

## 5. Visual "Rhyming" Logic
The generator does not spawn individual items; it spawns **Vignettes** (Cluster Definitions). This preserves the narrative link between items.

*   **Wrong:** Spawning a "Ketchup Stain" randomly.
*   **Right:** Spawning a "Lunch Vignette" which contains `{ Ketchup Stain + Hotdog Wrapper + Bench }`.

This ensures that every visual puzzle in the game is solvable by observing the context.
```
