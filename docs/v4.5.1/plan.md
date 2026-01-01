    # START OF FILE plan.md
    # Context-Clean Plan Artifact
    **Project Version:** 4.5.1
    **Objective:** Expand Gameplay Depth (Crisis/Dialogue) & Polish Audio.

    ## Completed Tasks [x]
    - [x] **v4.5.0: Toolchain Fix:** Stabilized Next 15 + Tailwind 4 on Windows.
    - [x] **v4.5.0: Terrain:** Implemented `TerrainFactory` + Single-Pass Rendering.
    - [x] **v4.5.0: Visuals:** "Stardew-style" Trees and Textured Ground.
    - [x] **v4.5.1: Killer System:** Implemented Archetypes, Timer, Heat, and Dynamic "Planting" events.
- [x] **v4.5.1: Civilian System:** Implemented AI movement between Safe Zones.
- [x] **v4.5.1: Documentation:** Full suite created (`docs/*.md`).

## Current / Pending Tasks [ ]

### v4.6.0: The Interaction Update
**Goal:** Implement the missing high-priority interaction systems.
- [ ] **1. Dialogue System**
    - [ ] Create `systems/gameplay/DialogueSystem.ts`.
    - [ ] Logic: Click Actor -> Check if Killer -> Return "Rumor" or "Lie".
    - [ ] UI: Post results to `feed` as `VOICE` messages.
- [ ] **2. Crisis System**
    - [ ] Create `systems/gameplay/CrisisSystem.ts`.
    - [ ] Logic: Handle `SCENARIO_ACTIVE` state interactions (Bomb Defusal / Rescue).
    - [ ] Visuals: Add `prop_bomb` and `prop_bottle` (Poison) to Painters.

### v4.7.0: The Audio Update
**Goal:** Add sound to the "Visual Rhymes".
- [ ] **1. Audio Engine:** Configure `howler` in a store or utility.
- [ ] **2. SFX:** Add cues for `CRIME` found (positive), `HERRING` (negative), and `KILLER_EVENT` (warning).

## Micro-Steps for Next Agent (v4.6.0)
1.  **Review:** Read `docs/INTERACTION_SYSTEMS.md` (The Spec).
2.  **Scaffold:** Create `DialogueSystem.ts` based on the spec.
3.  **Integrate:** Hook it into `InteractionRouter.ts`.
4.  **Test:** Click civilians and verify "Rumor" text appears in the feed.
# END OF FILE plan.md