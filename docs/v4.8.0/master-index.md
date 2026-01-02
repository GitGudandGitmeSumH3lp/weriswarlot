# Master Documentation Index
**Project:** WERISWARLOT  
**Core Version:** 4.7.0  
**Scope:** Forensic Simulation Framework

## 1. Logic & Architecture
| File | Purpose | Status |
| :--- | :--- | :--- |
| `research.md` | Tracks APIs, build toolchain fixes, and Performance Bottlenecks. | **Active** |
| `system.md` | Defines architectural patterns (Performance, State, Interaction). | **Active** |
| `docs/ARCHITECTURE.md` | Maps the hybrid Logic-View data flow. | **Active** |
| `docs/GAME_STATE.md` | Details global state phases and win/loss scoring math. | **Active** |

## 2. Game Systems
| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/SPAWNING_SYSTEM.md` | Hybrid logic of static zones and context vignettes. | **Active** |
| `docs/KILLER_SYSTEM.md` | Timer, Heat, and Dynamic Planting mechanics. | **Active** |
| `docs/CIVILIAN_SYSTEM.md` | Movement AI and the Reactive Panic state. | **Active** |
| `docs/INTERACTION_SYSTEMS.md` | Social layer: Interrogation, Witness Memories, and NPC Logic. | **Active** |
| `docs/CRISIS_SYSTEM.md` | **[NEW]** High-stakes end-game scenarios (Bomb/Poison). | **Active** |
| `docs/DEBUG_SYSTEM.md` | **[NEW]** God Mode controls and simulation verification tools. | **Active** |

## 3. Asset Glossaries
| File | Purpose | Status |
| :--- | :--- | :--- |
| `docs/PAINTERS.md` | Dictionary of all Character, Prop, and Crisis texture keys. | **Active** |
| `src/data/RumorRegistry.ts`| Witness-to-Text conversion logic. | **Active** |

## 4. System Dependencies
1. **`CRISIS_SYSTEM.md`** → depends on **`docs/GAME_STATE.md`**: Crisis outcomes trigger Level Complete or Game Over.
2. **`INTERACTION_SYSTEMS.md`** → depends on **`docs/KILLER_SYSTEM.md`**: Witnesses observe killer visual traits.
3. **`DEBUG_SYSTEM.md`** → depends on **Entire Store**: Requires full read/write access to simulation variables.