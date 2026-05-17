#!/usr/bin/env python3
"""Generate site OG image (1200x630) for LiveMusic DFW."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630

# Colors
BG = (13, 13, 19)           # near-black #0D0D13
PURPLE = (124, 58, 237)     # Deep Ellum purple #7C3AED
GREEN = (5, 150, 105)        # Lower Greenville green #059669
ORANGE = (234, 88, 12)       # Bishop Arts orange #EA580C
BLUE = (37, 99, 235)         # Lakewood blue #2563EB
BROWN = (146, 64, 14)        # Fort Worth brown #92400E
GOLD = (217, 119, 6)         # accent #D97706
WHITE = (255, 255, 255)
LIGHT_GRAY = (180, 180, 190)
DARK_GRAY = (40, 40, 50)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# ── Font setup ──────────────────────────────────────────────────────────
font_paths = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Arial.ttf",
]
def get_font(size, bold=False):
    for fp in font_paths:
        try:
            return ImageFont.truetype(fp, size)
        except Exception:
            pass
    return ImageFont.load_default()

title_font = get_font(96, bold=True)
subtitle_font = get_font(38)
tag_font = get_font(28)
small_font = get_font(22)

# ── Background gradient wash (simple horizontal) ──────────────────────
for x in range(W):
    ratio = x / W
    r = int(BG[0] + (PURPLE[0] - BG[0]) * ratio * 0.15)
    g = int(BG[1] + (PURPLE[1] - BG[1]) * ratio * 0.15)
    b = int(BG[2] + (PURPLE[2] - BG[2]) * ratio * 0.15)
    d.line([(x, 0), (x, H)], fill=(r, g, b))

# ── Decorative colored bars (bottom third) ──────────────────────────────
bar_data = [
    (0, H-30, int(W*0.22), H, PURPLE),
    (int(W*0.22), H-30, int(W*0.45), H, GREEN),
    (int(W*0.45), H-30, int(W*0.65), H, ORANGE),
    (int(W*0.65), H-30, int(W*0.82), H, BLUE),
    (int(W*0.82), H-30, W, H, BROWN),
]
for x1, y1, x2, y2, color in bar_data:
    d.rectangle([x1, y1, x2, y2], fill=color)

# ── Top accent bar ─────────────────────────────────────────────────────
d.rectangle([0, 0, W, 6], fill=GOLD)

# ── Decorative circles (abstract music vibe) ──────────────────────────
def draw_circle(cx, cy, r, color, alpha=60):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*color, alpha))
    img.paste(Image.alpha_composite(Image.new("RGBA", (W, H), BG).convert("RGBA"), overlay), (0, 0))

draw_circle(950, 120, 180, PURPLE, 25)
draw_circle(1050, 200, 120, GREEN, 20)
draw_circle(150, 450, 100, ORANGE, 15)
draw_circle(1100, 480, 80, BLUE, 20)

# ── 🎵 music note decorative element (simple text) ────────────────────
d.text((60, 50), "🎵", fill=GOLD, font=get_font(64))

# ── Main title ──────────────────────────────────────────────────────────
title = "LiveMusic DFW"
# Center the text
bbox = d.textbbox((0, 0), title, font=title_font)
title_w = bbox[2] - bbox[0]
title_x = (W - title_w) // 2
d.text((title_x, 140), title, fill=WHITE, font=title_font)

# ── Subtitle ────────────────────────────────────────────────────────────
subtitle = "Dallas · Fort Worth Live Music Guide"
bbox2 = d.textbbox((0, 0), subtitle, font=subtitle_font)
sub_x = (W - (bbox2[2]-bbox2[0])) // 2
d.text((sub_x, 255), subtitle, fill=LIGHT_GRAY, font=subtitle_font)

# ── Tag line ────────────────────────────────────────────────────────────
tag = "Free shows · Local bands · No arena fees"
bbox3 = d.textbbox((0, 0), tag, font=tag_font)
tag_x = (W - (bbox3[2]-bbox3[0])) // 2
d.text((tag_x, 320), tag, fill=GOLD, font=tag_font)

# ── Bottom text ─────────────────────────────────────────────────────────
bottom = "livemusic.dailydallasnews.com"
bbox4 = d.textbbox((0, 0), bottom, font=small_font)
bx = (W - (bbox4[2]-bbox4[0])) // 2
d.text((bx, H - 80), bottom, fill=(150, 150, 160), font=small_font)

# ── "This Week's Shows" pill ───────────────────────────────────────────
pill_text = "🎸 This Week's Shows"
bbox5 = d.textbbox((0, 0), pill_text, font=subtitle_font)
pw = bbox5[2] - bbox5[0] + 48
px = (W - pw) // 2
py = 385
# pill background
d.rounded_rectangle([px, py, px+pw, py+60], radius=12, fill=DARK_GRAY)
d.text((px+24, py+10), pill_text, fill=WHITE, font=subtitle_font)

# ── Save ───────────────────────────────────────────────────────────────
base = "/Users/philipbernard/livemusic-dfw"
out_path = f"{base}/public/og-image.png"
img.save(out_path, "PNG", optimize=True)
print(f"Saved OG image to {out_path}")