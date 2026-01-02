# Master Documentation Index
**Project:** WERISWARLOT  
**Core Version:** 4.6.0  
**Scope:** Forensic Simulation Framework

## 1. Logic & Architecture
| File | Purpose | Status |
| :--- | :--- | :--- |
| `research.md` | Tracks APIs, build toolchain fixes, and "Bridge Analysis." | **Active** |
| `system.md` | Defines architectural patterns (Z-Indexing, State, Context). | **Active** |
| `docs/ARCHITECTURE.md` | Maps data flow from Generation to View. | **Active** |
| `docs/GAME_STATE.md` | Details global state machine and win/loss scoring. | **Active** |

## 2. Game Systems
| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/SPAWNING_SYSTEM.md` | Explains static/dynamic spawn logic. | **Active** |
| `docs/EVIDENCE_SYSTEM.md` | Documents the "Visual Rhyme" and CRIME vs. HERRING logic. | **Active** |
| `docs/KILLER_SYSTEM.md` | Details Timer, Heat, and Dynamic Planting. | **Active** |
| `docs/CIVILIAN_SYSTEM.md` | Details movement AI and Reactive Panic. | **Active** |
| `docs/INTERACTION_SYSTEMS.md` | **[UPDATED]** Manual for Interrogation, Witness Memories, and Crisis logic. | **Active** |

## 3. Asset Glossaries
| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/PAINTERS.md` | Dictionary of all Character and Prop texture keys. | **Active** |
| `src/data/RumorRegistry.ts`| **[NEW]** Logic for converting witness memory to dialogue. | **Active** |

## 4. System Dependencies
1. **`INTERACTION_SYSTEMS.md`** → depends on **`docs/KILLER_SYSTEM.md`**: Witnesses pull visual traits from the current Killer Archetype.
2. **`World.tsx`** → depends on **`VignetteRegistry.ts`**: Uses `spawnVignette` to inject clues into the world state.
3. **`SceneLayer.tsx`** → depends on **Pixi v8 Event Specs**: Standardized `onPointerDown` listeners.