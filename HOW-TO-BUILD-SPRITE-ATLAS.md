# How to Build a Sprite Atlas

This explains the process used to turn a raw sprite sheet image into a usable JSON atlas (exact frame coordinates) for animation.

## The Core Idea

A sprite sheet is one big image containing many character poses. To animate a character, code needs to know the **exact pixel rectangle** (`x`, `y`, `width`, `height`) of every individual frame on that sheet. A JSON atlas is just a data file listing those rectangles by name.

```json
{
  "frames": {
    "walk_0": { "frame": { "x": 5, "y": 15, "w": 34, "h": 78 } },
    "walk_1": { "frame": { "x": 53, "y": 16, "w": 35, "h": 77 } }
  }
}
```

---

## Step 1: Check the Sheet Has Real Transparency

Before anything else, check the sheet uses a true **alpha channel** (transparent background), not a solid background color. This matters because transparency-based detection is far more reliable than color-matching.

```python
from PIL import Image
img = Image.open('sheet.png').convert('RGBA')
px = img.load()
print(px[0, 0])  # should be something like (255, 255, 255, 0) — alpha = 0 means transparent
```

If alpha is `0` at the corners/background, you're good. If the sheet only has a solid background color instead (no real transparency), detection is far less reliable — a cleaner sheet is worth switching to if possible.

## Step 2: Find Frame Boundaries via Connected-Component Detection

Instead of guessing coordinates by eye, scan the image for "islands" of non-transparent pixels — each island is one sprite frame.

```python
import numpy as np
from scipy import ndimage

arr = np.array(img)
alpha = arr[:, :, 3]
content_mask = alpha > 10  # anything with meaningful opacity counts as "content"

labeled, num_features = ndimage.label(content_mask, structure=np.ones((3,3)))
```

This automatically finds every separate blob of pixels — usually one blob per frame.

## Step 3: Extract Bounding Boxes, Filter Noise

For each detected blob, get its bounding rectangle. Skip tiny blobs (a few stray pixels), since those are usually anti-aliasing noise, not real frames.

```python
boxes = []
for i in range(1, num_features + 1):
    ys, xs = np.where(labeled == i)
    if len(xs) < 20:  # skip noise
        continue
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    boxes.append((x0, y0, x1 - x0 + 1, y1 - y0 + 1))
```

## Step 4: Watch for Merged Frames

Sometimes two adjacent frames touch (a fist or foot overlaps into the next cell), so they get detected as one blob instead of two. Flag anything much taller/wider than a typical frame:

```python
import statistics
heights = [b[3] for b in boxes]
median_h = statistics.median(heights)
merged = [b for b in boxes if b[3] > median_h * 1.5]
```

**Fixing a merged box:** crop just that region and manually split it (usually evenly, by row or column), then re-run tight-bbox detection on each half so the split frames still hug the actual content:

```python
def tight_bbox(x0, y0, w, h):
    sub = alpha[y0:y0+h, x0:x0+w]
    mask = sub > 10
    ys, xs = np.where(mask)
    return (x0 + xs.min(), y0 + ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1)
```

## Step 5: Restrict Detection to One Row/Section at a Time (for messy sheets)

If a sheet mixes multiple background colors, portraits, UI, or dense unrelated content, detecting the *whole* sheet at once causes everything to merge into one giant blob. The fix: crop or mask down to just the row/section you need before running detection.

```python
region_y0, region_y1 = 115, 175
region_x0, region_x1 = 0, 250
sub_mask = np.zeros_like(content_mask)
sub_mask[region_y0:region_y1, region_x0:region_x1] = content_mask[region_y0:region_y1, region_x0:region_x1]
```

This is also the technique used to pull out **just specific animations** (e.g. only "walk forward" frames) from a large multi-animation sheet, without processing the whole thing.

## Step 6: Name the Frames

Frame *coordinates* are exact once detected — frame *names* require identifying what pose each one actually is. If the sheet has labels (e.g. "Stand", "Walk", "Dash Forward"), use those directly. If not, group frames by row/visual pattern and assign names in sequence:

```python
names = [f"walk_{i}" for i in range(len(walk_boxes))]
```

Always double-check names against a visual preview — coordinates can be trusted automatically, names should be visually confirmed.

## Step 7: Generate the Atlas JSON

```python
import json

atlas = {"frames": {}}
for name, (x, y, w, h) in zip(names, boxes):
    atlas["frames"][name] = {"frame": {"x": x, "y": y, "w": w, "h": h}}

with open('atlas.json', 'w') as f:
    json.dump(atlas, f, indent=2)
```

## Step 8: Generate a Labeled Preview (always do this)

Draw the detected boxes + names back onto a copy of the sheet, so you can visually confirm everything is correct before using it in code.

```python
from PIL import ImageDraw

preview = img.convert('RGB')
draw = ImageDraw.Draw(preview)
for name, (x, y, w, h) in zip(names, boxes):
    draw.rectangle([x, y, x+w, y+h], outline=(255, 0, 0), width=1)
    draw.text((x+1, y+1), name, fill=(0, 255, 0))
preview.save('labeled_preview.png')
```

---

## Using Frames From Multiple Sheets

If one sheet doesn't have every animation you need (e.g. missing "walk forward"), pull those specific frames from a second sheet instead of forcing everything into one file. Add a `"sheet"` field to each atlas entry so the loader knows which image to pull from:

```json
{
  "frames": {
    "walk_forward_0": {
      "sheet": "sheet-a.png",
      "frame": { "x": 5, "y": 15, "w": 34, "h": 78 }
    },
    "idle_0": {
      "sheet": "sheet-b.png",
      "frame": { "x": 0, "y": 0, "w": 40, "h": 78 }
    }
  }
}
```

In code, load all referenced sheets up front, then pick the right one per frame when drawing:

```javascript
const sheets = {
    'sheet-a.png': sheetImageA,
    'sheet-b.png': sheetImageB
};

function drawFrame(frameData) {
    const img = sheets[frameData.sheet];
    ctx.drawImage(
        img,
        frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h,
        fighter.x, fighter.y, frameData.frame.w, frameData.frame.h
    );
}
```

---

## Summary Checklist

- [ ] Confirm the sheet has real alpha transparency
- [ ] Run connected-component detection on the alpha channel
- [ ] Filter out tiny noise blobs
- [ ] Flag and manually split any merged frames
- [ ] If the sheet is dense/messy, restrict detection to one row/section at a time
- [ ] Name frames using sheet labels if available, otherwise group by visual pattern
- [ ] Generate the JSON atlas
- [ ] Generate a labeled preview image and visually verify before using in code
- [ ] Add a `"sheet"` field per frame if pulling from multiple source images
