## "Gotchas" & Lessons Learned (v4.6.0)
* **Pixi v8 Hook Structure:** `useApplication()` now returns an `ApplicationState` object. The actual Pixi instance is accessed via `(useApplication() as any).app`.
* **Standardized Event Naming:** In `@pixi/react` v8, event props for intrinsic elements (like `pixiGraphics`) MUST follow React camelCase: use `onPointerDown` instead of `onpointerdown`.
* **HitArea Requirement:** Procedurally drawn graphics (pixel-by-pixel) lack a cohesive hitArea. For reliable clicks, always inject a `hitArea={new Rectangle(...)}`.
* **Witness Radius Logic:** By capturing the killer's action coordinates in `World.tsx`, we can perform an O(n) distance check against actors to simulate "memory" without a complex sensory system.