# Inspection System (The Sherlock Scan)
**System:** SocialLayer
**Related Files:** `InspectionLayer.tsx`, `DetailPainters.ts`, `InspectionRegistry.ts`

## 1. Overview
The Inspection System allows players to examine specific body regions of a suspect during interrogation to find concealed evidence (e.g., blood on hands, mud on shoes).

## 2. Architecture: The "Dress-Up" Logic
Unlike standard props, visual clues are not baked into the character sprites. They are injected dynamically at runtime.

1.  **Definition:** `KillerRegistry.ts` defines which clues (`VisualTrait`) belong to which archetype.
2.  **Injection:** In `World.tsx`, when the world generates, the system identifies the Killer entity and injects the trait data into its `activeTraits` array.
3.  **Rendering:** `InterrogationOverlay.tsx` renders the base character, then iterates through `activeTraits` to call the specific `DetailPainter` (drawing blood/mud on top).

## 3. The HTML Overlay Strategy
To avoid complex hit-testing on transparent Pixi pixels, interaction is handled via an invisible HTML grid.

*   **Mapping:** `InspectionRegistry.ts` defines CSS coordinates (`top`, `left`, `width`, `height`) for body regions (HEAD, TORSO, HANDS, FEET) relative to the 200x250 container.
*   **Clicking:** Clicking a region triggers `handleInspect(region)`.
*   **Validation:** The system checks if the Target Entity has an active trait in that region.
    *   **Match:** Evidence logged (`logEvidence`).
    *   **Miss:** Generic feedback ("Nothing unusual").

## 4. Visual Traits
| Key | Region | Painter | Quality | Description |
| :--- | :--- | :--- | :--- | :--- |
| `blood_hands` | HANDS | Red tips on fingers. | CRIME | Psychopath trait. |
| `muddy_shoes` | FEET | Brown clumps on shoes. | CRIME | Professional/Psychopath trait. |
| `paint_smear` | TORSO | Red streak on shirt. | HERRING | Opportunist trait. |
| `torn_pocket` | LEGS | Black rip line. | CRIME | Opportunist trait. |