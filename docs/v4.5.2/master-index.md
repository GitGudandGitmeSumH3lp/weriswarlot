# START OF FILE master-index.md
# Master Documentation Index
**Project:** WERISWARLOT  
**Core Version:** 4.5.2  
**Scope:** Forensic Simulation Framework

## 1. Logic & Architecture
*Files defining the core engine rules and data flow.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `research.md` | Tracks APIs, build toolchain fixes, and "Bridge Analysis" of system connections. | **Active** |
| `system.md` | Defines the rigid rulebook for architectural patterns (Z-Indexing, State, Context). | **Active** |
| `docs/ARCHITECTURE.md` | Maps the unidirectional data flow from Generation (WorldGen) to View (Pixi/HUD). | **Active** |
| `docs/GAME_STATE.md` | Details the global state machine phases and win/loss scoring math. | **Active** |
| `plan.md` | Tracks granular micro-steps and development sprints. | **Active** |

## 2. Game Systems
*Files defining specific gameplay mechanics and world behaviors.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/SPAWNING_SYSTEM.md` | Explains hybrid logic of static zones and dynamic context vignette placement. | **Active** |
| `docs/EVIDENCE_SYSTEM.md` | Documents the "Visual Rhyme" mechanic and CRIME vs. HERRING logic. | **Active** |
| `docs/KILLER_SYSTEM.md` | Details Timer, Heat growth, and Dynamic Planting mechanics. | **Active** |
| `docs/CIVILIAN_SYSTEM.md` | Details movement AI and the **Reactive Panic State** (linked to Heat). | **Active** |
| `docs/INTERACTION_SYSTEMS.md` | Functional spec for NPC Interrogation and Crisis scenarios. | **Placeholder** |

## 3. Asset Glossaries
*Dictionaries for visual and narrative content.*

| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/PAINTERS.md` | Dictionary of all Character and Prop texture keys. | **Active** |

## 4. System Dependencies
1.  **`CIVILIAN_SYSTEM.md`** → depends on **`docs/KILLER_SYSTEM.md`**: Heat thresholds (30/70) drive NPC state transitions.
2.  **`KILLER_SYSTEM.md`** → depends on **`docs/SPAWNING_SYSTEM.md`**: Uses `spawns.danger` for anomaly placement.
3.  **`ARCHITECTURE.md`** → depends on **`system.md`**: Adheres to the Provider/Consumer rule for Pixi/React context.
# END OF FILE master-index.md