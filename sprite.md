# Sprite Atlas — What We Did & How It's Used

## What We Did

The original sprite sheet (`fighter2.png`) turned out to be a dense reference dump — multiple background colors, portraits, palette swatches, and background art all mixed into one 1022×8000px image with frames that directly touched each other. Automated slicing failed on it twice (tested directly, not just assumed), so we switched to a cleaner sheet instead of fighting that file.

**New sheet:** `character-sprites.png` — a proper transparent-background (PNG alpha) sprite sheet, one character, no extra clutter.

### Process
1. **Verified transparency** — confirmed the sheet uses a true alpha channel (not a solid background color), which makes automated frame detection reliable
2. **Ran connected-component detection** on the alpha channel — this scans the image and finds every "island" of non-transparent pixels, treating each island as one sprite frame
3. **Got 36 frames automatically** — 33 were clean single frames right away
4. **Fixed 3 merged frames** — a few kick animations had a leg extending into the neighboring cell, causing 2–3 frames to get detected as one blob. These were manually split using tight content bounds, bringing the total to **40 individual frames**
5. **Grouped and named frames** by visual pose pattern: `walk_0–3`, `walk_back_0–3`, `punch_0–2`, `idle_0–4`, `fireball_0–1`, `fireball_impact_0–3`, `kick_0–12`, `crouch_0–4`

⚠️ **Note:** frame *coordinates* are exact (pulled from real pixel data). Frame *names* are a best-guess grouping by pose — worth a quick visual sanity check against `labeled_atlas_preview.png` and renaming anything that's off before relying on the names in code.

### Output Files
- **`character-sprites.png`** — the actual sprite sheet image to load in-game
- **`character-atlas.json`** — the atlas data: exact pixel rectangle for every frame
- **`labeled_atlas_preview.png`** — the sheet with boxes + names drawn on top, for visual verification

---

## What the Atlas JSON Looks Like

```json
{
  "frames": {
    "walk_0": { "frame": { "x": 10, "y": 3, "w": 50, "h": 73 } },
    "walk_1": { "frame": { "x": 80, "y": 6, "w": 51, "h": 70 } },
    "punch_0": { "frame": { "x": 15, "y": 161, "w": 37, "h": 79 } }
  }
}
```

Each entry is one frame: which animation it belongs to (the name prefix), and exactly where to find it on the sprite sheet (`x`, `y`, `w`, `h` in pixels).

---

## How This Becomes Sprite Animation

### 1. Load both files
```javascript
const sheetImage = new Image();
sheetImage.src = 'assets/character-sprites.png';

const atlas = await fetch('assets/character-atlas.json').then(res => res.json());
```

### 2. Group frames by animation name
Since frames are named `walk_0`, `walk_1`, `walk_2`... the loader groups them by stripping the trailing number:

```javascript
function buildAnimations(atlas) {
    const animations = {};
    for (const frameName in atlas.frames) {
        const animName = frameName.replace(/_\d+$/, ''); // "walk_0" -> "walk"
        if (!animations[animName]) animations[animName] = [];
        animations[animName].push(atlas.frames[frameName].frame);
    }
    return animations;
}
// Result: { walk: [rect0, rect1, rect2, rect3], punch: [rect0, rect1, rect2], ... }
```

### 3. Play a frame each tick
The animator tracks which animation is currently active (driven by the fighter's `state`) and which frame index it's on, advancing every few game-loop ticks:

```javascript
function playAnimation(fighter, animations) {
    const frames = animations[fighter.state]; // e.g. "walk"
    const rect = frames[fighter.frameIndex];

    ctx.drawImage(
        sheetImage,
        rect.x, rect.y, rect.w, rect.h,       // source rectangle on the sheet
        fighter.x, fighter.y, rect.w, rect.h  // where to draw it on canvas
    );

    fighter.frameTimer++;
    if (fighter.frameTimer > FRAME_DELAY) {
        fighter.frameIndex = (fighter.frameIndex + 1) % frames.length; // loop
        fighter.frameTimer = 0;
    }
}
```

### 4. State drives animation, automatically
Because the fighter's `state` (already being tracked by the state machine) matches the atlas's animation names (`idle`, `walk`, `punch`, `kick`...), swapping animations is just reading `fighter.state` — no extra wiring needed:

```javascript
// in the game loop, once per frame:
playAnimation(player1, animations);
playAnimation(player2, animations);
```

Attack states (`punch`, `kick`) should play once and stop instead of looping — that's a small branch in the same function (check if `fighter.state` is an attack type, and don't wrap `frameIndex` back to 0 at the end).

---

## What's Left Before This Is Fully Wired In
- Confirm/rename the frame groupings in `character-atlas.json` if any don't match the actual move
- Write the actual `loadAtlas()` + `playAnimation()` functions in code (teammate's task, per `TEAM-WORKFLOW.md`)
- Map fighter `state` values exactly to atlas animation names so they match 1:1
- Handle facing direction (mirror the drawn sprite when facing left)