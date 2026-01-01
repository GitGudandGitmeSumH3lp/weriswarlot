# START OF FILE system.md
# Context-Clean System Artifact
**Project Version:** 4.5.1

## Core Rules
1.  **The Provider/Consumer Rule:**
    *   **NEVER** call `useTick` or `useApplication` inside `World.tsx` (The Provider).
    *   **ALWAYS** call them inside `SceneLayer.tsx` (The Consumer).
2.  **The State Hydration Rule:**
    *   Static data (Layout) can use `useMemo`.
    *   Dynamic data (Actors, Decals) **MUST** use `useState` in `World.tsx` and be passed down via props/setters to Systems.
3.  **The Visual Rhyme Rule:**
    *   Every interactive prop must have a defined `quality` in `VignetteRegistry` (`CRIME` | `HERRING` | `AMBIANCE`).
    *   Painters must exist for every key in the Registry.

## Standardized Patterns
*   **Killer Logic:** Defined in `KillerRegistry`, executed by `KillerSystem`, stored in `gameStore`.
*   **Civilian Logic:** Stateless "Target-Seek" loop in `CivilianSystem`.
*   **Vignette Injection:** Use `spawnVignette(id, x, y)` utility to inject props at runtime.
*   **Pixi Hooks:** Use `useTick((ticker) => ...)` (v8 signature).

## Build Constraints (Critical)
*   **Tailwind:** Use v4 `latest` tag + `postcss.config.js` (CommonJS) on Windows.
*   **Dependencies:** Do not downgrade React below 19 if using `@pixi/react` v8.
# END OF FILE system.md