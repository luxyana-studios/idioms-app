#!/usr/bin/env python3
"""
IdiomDeck — Premium App Icon 512x512
Design: Luxury monogram seal. Deep warm dark background, gold circular
ornamental ring, bold "ID" monogram, fine typographic details.
Aesthetic: editorial / literary-luxury. Timeless, premium, distinctive.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

SIZE   = 512
CX, CY = SIZE // 2, SIZE // 2
OUT    = "/home/david/repos/idioms-app/app_stores/android/assets/icon_512.png"

# ── Palette ──────────────────────────────────────────────────────────────────
BG        = (18, 15, 10)       # near-black warm brown
BG_MID    = (28, 23, 16)       # slightly lighter center
GOLD      = (212, 155, 95)     # warm gold
GOLD_DIM  = (160, 115, 65)     # muted gold for secondary elements
GOLD_LT   = (240, 195, 130)    # bright highlight gold
CREAM     = (235, 215, 180)    # warm white

FONT_BOLD  = "/usr/share/fonts/truetype/ubuntu/UbuntuSans[wdth,wght].ttf"
FONT_LIGHT = "/usr/share/fonts/truetype/ubuntu/UbuntuSans[wdth,wght].ttf"

def fnt(size):
    try:   return ImageFont.truetype(FONT_BOLD, size)
    except: return ImageFont.load_default()

def hex_rgba(r,g,b,a=255): return (r,g,b,a)

# ── Helpers ───────────────────────────────────────────────────────────────────
def add_layer(base, layer):
    b = base.convert("RGBA")
    b.alpha_composite(layer)
    return b

def radial_gradient(size, center_col, edge_col):
    """Smooth radial gradient background."""
    img = Image.new("RGB", (size, size))
    for y in range(size):
        for x in range(size):
            d = math.sqrt((x - size/2)**2 + (y - size/2)**2) / (size * 0.72)
            d = min(d, 1.0)
            r = int(center_col[0] + (edge_col[0]-center_col[0])*d)
            g = int(center_col[1] + (edge_col[1]-center_col[1])*d)
            b = int(center_col[2] + (edge_col[2]-center_col[2])*d)
            img.putpixel((x, y), (r, g, b))
    return img

def draw_arc_dashes(draw, cx, cy, r, n_dashes, dash_len_deg, width, color):
    """Draw evenly spaced arc dashes on a circle."""
    step = 360 / n_dashes
    for i in range(n_dashes):
        start = i * step
        end   = start + dash_len_deg
        draw.arc([cx-r, cy-r, cx+r, cy+r], start=start, end=end,
                 fill=color, width=width)

def draw_diamond(draw, cx, cy, size, color):
    pts = [
        (cx,       cy-size),
        (cx+size,  cy),
        (cx,       cy+size),
        (cx-size,  cy),
    ]
    draw.polygon(pts, fill=color)

def draw_thin_line(draw, cx, cy, angle_deg, length, color, width=2):
    a = math.radians(angle_deg)
    x1 = cx + math.cos(a) * length
    y1 = cy - math.sin(a) * length
    x2 = cx - math.cos(a) * length
    y2 = cy + math.sin(a) * length
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

# ── Build icon ────────────────────────────────────────────────────────────────
def make_icon():
    # 1. Radial gradient base (pixel-by-pixel — do on small then upscale for speed)
    grad_small = radial_gradient(128, BG_MID, BG)
    base_rgb   = grad_small.resize((SIZE, SIZE), Image.BILINEAR)

    # 2. Clip to rounded square
    mask_rnd = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask_rnd).rounded_rectangle([0, 0, SIZE, SIZE], radius=90, fill=255)
    base_rgba = base_rgb.convert("RGBA")
    alpha = base_rgba.split()[3]
    base_rgba.putalpha(mask_rnd)

    # 3. Subtle warm glow top-right (atmospheric blob)
    glow = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    ImageDraw.Draw(glow).ellipse([SIZE-220, -80, SIZE+60, 210],
                                  fill=(110, 80, 40, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    base_rgba.alpha_composite(glow)

    # 4. Working draw surface
    img  = base_rgba
    draw = ImageDraw.Draw(img)

    # ── Ring system ──────────────────────────────────────────────────────────
    R_OUTER = 195   # outer decorative ring
    R_INNER = 180   # inner solid ring
    R_TEXT  = 158   # text track radius

    # Outer thin ring (dashed — 24 dashes)
    draw_arc_dashes(draw, CX, CY, R_OUTER, 24, 9, 2, GOLD_DIM + (200,))

    # Solid gold ring
    draw.ellipse([CX-R_INNER, CY-R_INNER, CX+R_INNER, CY+R_INNER],
                 outline=GOLD+(255,), width=3)

    # Inner hairline ring
    draw.ellipse([CX-R_TEXT+2, CY-R_TEXT+2, CX+R_TEXT-2, CY+R_TEXT-2],
                 outline=GOLD_DIM+(160,), width=1)

    # ── Cardinal ornaments (tiny diamonds at N/S/E/W) ──────────────────────
    for angle in [0, 90, 180, 270]:
        a = math.radians(angle)
        ox = int(CX + math.cos(a) * (R_INNER + 8))
        oy = int(CY - math.sin(a) * (R_INNER + 8))
        draw_diamond(draw, ox, oy, 5, GOLD+(255,))

    # ── Monogram "ID" ─────────────────────────────────────────────────────────
    # Large bold monogram
    mono_size = 172
    mono_f    = fnt(mono_size)

    text = "ID"
    # Measure
    bb   = mono_f.getbbox(text)
    tw   = bb[2] - bb[0]
    th   = bb[3] - bb[1]
    tx   = CX - tw // 2 - bb[0]
    ty   = CY - th // 2 - bb[1] - 10

    # Subtle shadow
    shadow = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    ImageDraw.Draw(shadow).text((tx+5, ty+6), text, font=mono_f,
                                 fill=(0,0,0,120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
    img.alpha_composite(shadow)
    draw = ImageDraw.Draw(img)

    # Main gold "ID"
    draw.text((tx, ty), text, font=mono_f, fill=GOLD_LT+(255,))

    # Tiny highlight pass (offset up-left slightly for 3D feel)
    draw.text((tx-1, ty-1), text, font=mono_f, fill=GOLD_LT+(80,))

    # ── Horizontal ornament lines flanking monogram ───────────────────────
    line_y  = CY + th // 2 - bb[1] - 10 + 14
    line_x0 = CX - 88
    line_x1 = CX + 88
    gap_half = 28

    for side in [-1, 1]:
        x_start = CX + side * gap_half
        x_end   = CX + side * 88
        draw.line([(x_start, line_y), (x_end, line_y)], fill=GOLD_DIM+(220,), width=2)
        # End dot
        ex = x_end
        draw.ellipse([ex-3, line_y-3, ex+3, line_y+3], fill=GOLD+(220,))

    # ── "IDIOMDECK" arc text ──────────────────────────────────────────────────
    label      = "IDIOMDECK"
    label_f    = fnt(24)
    n          = len(label)
    arc_r      = R_TEXT - 18
    # Start/end angles (math convention: 0=right, CCW positive)
    # We want text along top arc, centred at 270° (top), sweeping ±60°
    center_angle = 270   # top of circle
    sweep        = 108   # degrees total
    start_a      = center_angle - sweep / 2

    for i, ch in enumerate(label):
        angle_deg = start_a + i * (sweep / (n - 1))
        angle_rad = math.radians(angle_deg)
        px = CX + arc_r * math.cos(angle_rad)
        py = CY + arc_r * math.sin(angle_rad)
        # Character tangent rotation: text reads clockwise on top arc
        rot_deg = angle_deg + 90
        ch_img = Image.new("RGBA", (60, 60), (0,0,0,0))
        ImageDraw.Draw(ch_img).text((30, 30), ch, font=label_f,
                                     fill=GOLD+(245,), anchor="mm")
        ch_rot = ch_img.rotate(-rot_deg, expand=False, resample=Image.BICUBIC)
        bx = int(px) - ch_rot.width  // 2
        by = int(py) - ch_rot.height // 2
        img.alpha_composite(ch_rot, (bx, by))

    draw = ImageDraw.Draw(img)

    # ── Small dots bottom arc (opposite to text) ─────────────────────────────
    for angle in range(110, 251, 14):
        a  = math.radians(angle)
        px = int(CX + (R_TEXT - 12) * math.cos(a))
        py = int(CY + (R_TEXT - 12) * math.sin(a))
        draw.ellipse([px-2, py-2, px+2, py+2], fill=GOLD_DIM+(140,))

    # ── Flatten to RGB and save ───────────────────────────────────────────────
    final = Image.new("RGB", (SIZE, SIZE), BG)
    final.paste(img.convert("RGB"), mask=mask_rnd)
    final.save(OUT, "PNG", optimize=True)

    kb = os.path.getsize(OUT) / 1024
    print(f"Saved: {OUT}  ({kb:.1f} KB)")

make_icon()
