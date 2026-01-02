# Debug System (God Mode)
**System:** Tools
**Related Files:** `DebugDashboard.tsx`, `SceneLayer.tsx`, `gameStore.ts`

## 1. Access
God Mode is toggled via a secret, invisible 8x8px trigger in the **Bottom Left Corner** of the screen.

## 2. The Dashboard
Provides real-time simulation overrides:
*   **HEAT:** Force 100% heat to test Panic AI.
*   **TIMER:** Reset killer clock to force a crime event.
*   **SCORE:** Force 100% conviction to bypass investigation.

## 3. Visual Debugging
When God Mode is active, the NPC with `type: 'killer'` is rendered with a thick Red Stroke rectangle surrounding their sprite. This allows verification of killer camouflage and movement logic.