# Visual Asset Dictionary (Painters)
**System:** Visuals
**Related Files:** `utils/CharacterPainters.ts`, `utils/PropPainters.ts`

This document lists all procedural assets available in the `textureRegistry`. Use these keys when defining Actors in `WorldGenerator` or Props in `VignetteRegistry`.

---

## 1. Character Painters
Characters use a **Seeded Variant System**.
*   **Usage:** `base_key` (random) or `base_key_0` through `base_key_5` (specific).
*   **Dynamic:** Skin tone, hair color, and clothing colors change based on the variant index.

| Key | Archetype | Visual Description |
| :--- | :--- | :--- |
| `elder` | The Elderly | Cane, balding/grey hair, earth tones. |
| `punk` | The Rebel | Neon mohawks, dark clothes, side stripes. |
| `suit` | The Salaryman | Business suit, tie, briefcase. |
| `clown` | The Performer | Polka dots, bright wig, makeup. |
| `kid_balloon` | The Child | Small stature, baseball cap, holds a balloon. |
| `hipster` | The Creative | Plaid shirt, glasses, phone in hand. |
| `guitarist` | The Busker | Guitar on back, casual wear. |
| `bodybuilder` | The Gym Rat | Tank top, shorts, muscular build. |
| `cyclist` | The Rider | Helmet, tight neon outfit. |
| `tourist` | The Visitor | Sun hat, camera, loud shirt patterns. |
| `goth` | The Alternative | All black/grey, plaid accents, dark makeup. |
| `artist` | The Painter | Beret, paint splattered clothes, brush. |
| `gardener` | The Worker | Green uniform, shears. |
| `commuter` | The Traveler | Messenger bag, sensible clothes. |
| `glutton` | The Snacker | Holding food items, messy face. |

---

## 2. Prop Painters
Props are static or interactive environmental objects.
*   **Usage:** Use the exact key in `VignetteRegistry` or `CityGenerator`.

### A. Crime Scene (The Signal)
| Key | Description | Context |
| :--- | :--- | :--- |
| `chalk_mark` | White outline of a body. | Murder Scenes. |
| `blood_stain` | Dark red, irregular puddle. | Violent Crimes. |
| `blood_knife` | Silver blade with red tip. | Weapon. |
| `fresh_grave` | Mound of brown earth. | Burials. |
| `shovel_ground` | Shovel stuck in dirt. | Burials/Hiding. |
| `footprints` | Muddy shoe prints. | Tracking. |
| `dropped_phone` | Smartphone on ground. | Evidence. |
| `item_wallet` | Leather wallet. | Theft/ID. |
| `discarded_backpack` | Blue bag on ground. | Hiding spots. |

### B. Red Herrings (The Noise)
| Key | Description | Context |
| :--- | :--- | :--- |
| `ketchup_stain` | Bright red, round puddle. | Mimics Blood. |
| `paint_splat` | Red paint drops. | Mimics Blood. |
| `toy_gun` | Black gun with **Orange Tip**. | Mimics Weapon. |
| `gardening_trowel` | Small hand spade. | Mimics Shovel. |
| `hotdog_wrapper` | Yellow/White paper. | Explains Ketchup. |
| `paint_brush` | Brush with red tip. | Explains Paint. |

### C. Ambiance (The World)
| Key | Description | Notes |
| :--- | :--- | :--- |
| `bench` | Wooden park bench. | Standard furniture. |
| `trashcan` | Green metal bin. | Can contain trash. |
| `lamppost` | Tall light pole. | Light source. |
| `picnic_blanket` | Red/White plaid sheet. | Park context. |
| `picnic_basket` | Woven basket. | Park context. |
| `ice_cream_cart` | White cart, striped awning. | Vendor. |
| `balloon_stand` | Pole with colorful balloons. | Vendor. |
| `sapling_tree` | Small tree (Legacy). | *Replaced by stardew_tree visually.* |
| `stardew_tree` | Large, fluffy tree. | **Primary Tree Asset.** |
| `pile_trash` | Bag and papers. | Urban clutter. |

---

## 3. Special Keys (Overrides)
These keys are mapped in `World.tsx` to handle legacy generator types.

*   `tree` → Renders as `stardew_tree`.
*   `bush` → Renders as `trashcan` (Placeholder).
*   `statue` → Renders as `lamppost` (Placeholder).