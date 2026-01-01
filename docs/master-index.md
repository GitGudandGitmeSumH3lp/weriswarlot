# PHASE 1: RESEARCH (Initiated)
**Project:** WERISWARLOT  
**Version:** 4.5.0  
**Context Check:** Analyzed 9 core documentation artifacts spanning Architecture, Systems, and Data.

---

# START OF FILE master-index.md
# Master Documentation Index
**Project:** WERISWARLOT  
**Core Version:** 4.5.0  
**Scope:** Forensic Simulation Framework

## 1. Logic & Architecture
*Files defining the core engine rules and data flow.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `research.md` | Tracks the ground truth of APIs (Pixi v8, Next.js 15) and technical "gotchas." | **Active** |
| `system.md` | Defines the rigid rulebook for architectural patterns (Provider/Consumer rules). | **Active** |
| `docs/ARCHITECTURE.md` | Maps the unidirectional data flow from Generation (WorldGen) to View (Pixi/HUD). | **Active** |
| `docs/GAME_STATE.md` | Details the global state machine phases (IDLE, PLAYING, CONFRONTATION) and scoring logic. | **Active** |
| `plan.md` | Tracks granular micro-steps and the semantic versioning of the project. | **Active** |

## 2. Game Systems
*Files defining specific gameplay mechanics and world behaviors.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/SPAWNING_SYSTEM.md` | Explains the hybrid logic of static spawn zones and dynamic context-aware vignette placement. | **Active** |
| `docs/EVIDENCE_SYSTEM.md` | Documents the "Visual Rhyme" mechanic and how CRIME vs. HERRING quality affects conviction. | **Active** |
| `docs/INTERACTION_SYSTEMS.md` | Outlines the functional specification for NPC Interrogation and High-Stakes Crisis scenarios. | **Placeholder** |
| `docs/KILLER_SYSTEM.md` | **[NEW]** details the Timer, Heat, and Archetype mechanics. | **Active** |
| `docs/CIVILIAN_SYSTEM.md` | **[NEW]** Details the movement AI and camouflage logic. | **Active** |
| `docs/INTERACTION_SYSTEMS.md` | Outlines the functional specification for NPC Interrogation and High-Stakes Crisis scenarios. | **Placeholder** |

## 3. Asset Glossaries
*Dictionaries for visual and narrative content.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/PAINTERS.md` | A comprehensive dictionary of all Character and Prop texture keys for procedural rendering. | **Active** |

## 4. System Dependencies
*Cross-file connections that must be maintained for system integrity.*

1.  **`KILLER_SYSTEM.md`** → depends on **`docs/SPAWNING_SYSTEM.md`**: Uses the `spawns.danger` list defined in the spawning system.
2.  **`CIVILIAN_SYSTEM.md`** → depends on **`docs/SPAWNING_SYSTEM.md`**: Uses the `spawns.safe` list for pathfinding.
3.  **`EVIDENCE_SYSTEM.md`** → depends on **`docs/GAME_STATE.md`**: Evidence collection logic directly modifies the `convictionScore` stored in the global state.
4.  **`World.tsx`** → depends on **all glossary files**: Acts as the "Hydrator" mapping data strings to visual functions.

# END OF FILE master-index.md

---
