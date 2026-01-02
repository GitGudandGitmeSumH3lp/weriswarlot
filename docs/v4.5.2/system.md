# START OF FILE system.md
# Context-Clean System Artifact
**Project Version:** 4.5.2

## Core Rules
1. **Behavior Priority:** 
   *   Flee (Heat > 70) > Nervous (Heat > 30) > Wander (Default).
   *   Flee state MUST set `waitTimer = 0` on transition to break idling.
2. **Registry Mapping:** 
   *   Every `CityData` prop type MUST have a fallback painter.
   *   Killer-specific vignettes must be registered in `KillerRegistry.ts`.
3. **Z-Sorting:** Actors must use `zIndex: y` in the `SceneLayer` loop to ensure proper 2.5D overlapping.

## Build Constraints
*   **Next.js:** 15.1.3 (Stable).
*   **React:** 19.0.0 (Stable).
*   **Tailwind:** v4 (Standard PostCSS config).
# END OF FILE system.md

---

**Next Steps Micro-Action:**
1.  **Phase 1 Research:** Scrutinize `killerArchetype` vs. NPC dialogue possibilities. 
2.  **Phase 2 Planning:** Design the logic for "Witness" NPCs (those who were close to the killer or a crime) to give better clues than "Wanderers."

