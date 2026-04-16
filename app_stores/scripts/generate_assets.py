#!/usr/bin/env python3
"""Generate Play Store assets for IdiomDeck."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Brand colors (from app theme)
BG_COLOR = (22, 19, 14)          # #16130e - deep warm dark
ACCENT_COLOR = (212, 149, 106)   # #D4956A - warm gold
TEXT_WHITE = (255, 255, 255)
TEXT_CREAM = (232, 213, 183)     # warm cream
CARD_COLOR = (42, 38, 30)        # slightly lighter dark

PHONE_W, PHONE_H = 1080, 1920
FEATURE_W, FEATURE_H = 1024, 500

BASE = "/home/david/repos/idioms-app/app_stores/android/assets"
SCREENSHOTS_SRC = [
    "/home/david/Descargas/WhatsApp Image 2026-04-15 at 18.52.05.jpeg",
    "/home/david/Descargas/WhatsApp Image 2026-04-15 at 18.52.05 (1).jpeg",
    "/home/david/Descargas/WhatsApp Image 2026-04-15 at 18.52.05 (2).jpeg",
]

FONT_VAR = "/usr/share/fonts/truetype/ubuntu/UbuntuSans[wdth,wght].ttf"
FONT_REG = "/usr/share/fonts/truetype/ubuntu/Ubuntu[wdth,wght].ttf"

SCREENS = [
    {"verb": "LEARN", "desc": "A NEW IDIOM EVERY DAY", "idx": 0},
    {"verb": "DISCOVER", "desc": "THE ORIGIN STORIES", "idx": 1},
    {"verb": "MASTER", "desc": "ENGLISH EXPRESSIONS", "idx": 2},
]


def font(size, bold=False):
    path = FONT_VAR if not bold else FONT_REG
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill)


def add_glow_blob(img, cx, cy, radius, color_rgba):
    """Add a soft gaussian glow blob like the app's background blobs."""
    blob_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(blob_layer)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color_rgba)
    blob_layer = blob_layer.filter(ImageFilter.GaussianBlur(radius=radius // 2))
    img_rgba = img.convert("RGBA")
    img_rgba.alpha_composite(blob_layer)
    return img_rgba.convert("RGB")


def fit_screenshot_in_phone(src_path, target_w, target_h):
    """Resize screenshot to fit the phone mockup area, cropping to 9:16 from center."""
    img = Image.open(src_path)
    # Crop to 9:16
    src_w, src_h = img.size
    target_ratio = 9 / 16
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))
    return img.resize((target_w, target_h), Image.LANCZOS)


def make_phone_screenshot(verb, desc, src_path, out_path):
    canvas = Image.new("RGB", (PHONE_W, PHONE_H), BG_COLOR)

    # Background glow blobs (like the app)
    canvas = add_glow_blob(canvas, PHONE_W - 80, 80, 220, (101, 78, 46, 60))
    canvas = add_glow_blob(canvas, 60, PHONE_H - 200, 200, (101, 78, 46, 40))

    draw = ImageDraw.Draw(canvas)

    # ── Top text area ──────────────────────────────────────────────
    text_top = 120

    # Small app label
    label_font = font(32)
    draw.text((PHONE_W // 2, text_top), "IDIOMDECK", font=label_font,
              fill=ACCENT_COLOR, anchor="mm")

    # Big verb
    verb_font = font(148)
    # Auto-shrink if too wide
    while verb_font.getlength(verb) > PHONE_W * 0.82 and verb_font.size > 80:
        verb_font = font(verb_font.size - 8)
    draw.text((PHONE_W // 2, text_top + 100), verb,
              font=verb_font, fill=TEXT_WHITE, anchor="mm")

    # Description
    desc_font = font(52)
    while desc_font.getlength(desc) > PHONE_W * 0.80 and desc_font.size > 32:
        desc_font = font(desc_font.size - 4)
    draw.text((PHONE_W // 2, text_top + 230), desc,
              font=desc_font, fill=ACCENT_COLOR, anchor="mm")

    # ── Phone mockup frame ─────────────────────────────────────────
    frame_w = int(PHONE_W * 0.80)
    frame_h = int(frame_w * 16 / 9)
    frame_x = (PHONE_W - frame_w) // 2
    frame_y = text_top + 310

    # Drop shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle(
        [frame_x + 6, frame_y + 10, frame_x + frame_w + 6, frame_y + frame_h + 10],
        radius=40, fill=(0, 0, 0, 120)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20))
    canvas = canvas.convert("RGBA")
    canvas.alpha_composite(shadow)
    canvas = canvas.convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # Phone border
    border = 6
    draw_rounded_rect(draw,
        [frame_x - border, frame_y - border,
         frame_x + frame_w + border, frame_y + frame_h + border],
        radius=44, fill=(70, 62, 50))

    # Screenshot inside frame
    ss = fit_screenshot_in_phone(src_path, frame_w, frame_h)
    # Paste with rounded mask
    mask = Image.new("L", (frame_w, frame_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, frame_w, frame_h], radius=38, fill=255)
    canvas.paste(ss, (frame_x, frame_y), mask)

    canvas.save(out_path, "PNG", optimize=True)
    print(f"  Saved: {out_path}")


def make_feature_graphic(out_path):
    canvas = Image.new("RGB", (FEATURE_W, FEATURE_H), BG_COLOR)

    # Glow blobs
    canvas = add_glow_blob(canvas, FEATURE_W - 100, 60, 250, (101, 78, 46, 70))
    canvas = add_glow_blob(canvas, 80, FEATURE_H - 60, 180, (101, 78, 46, 50))

    draw = ImageDraw.Draw(canvas)

    # Left side — branding text
    cx = FEATURE_W // 3

    label_f = font(28)
    draw.text((cx, 130), "LUXYANA STUDIOS", font=label_f,
              fill=(150, 130, 100), anchor="mm")

    title_f = font(110)
    draw.text((cx, 245), "IdiomDeck", font=title_f,
              fill=TEXT_WHITE, anchor="mm")

    tagline_f = font(38)
    draw.text((cx, 330), "Master English Idioms", font=tagline_f,
              fill=ACCENT_COLOR, anchor="mm")

    # Divider line
    line_x = cx - 160
    draw.rectangle([line_x, 370, line_x + 320, 373], fill=(70, 60, 45))

    sub_f = font(30)
    draw.text((cx, 410), "Flashcards · Origin Stories · Daily Learning",
              font=sub_f, fill=(150, 130, 100), anchor="mm")

    # Right side — app screenshot preview
    ss_w = int(FEATURE_W * 0.30)
    ss_h = int(ss_w * 16 / 9)
    ss_x = int(FEATURE_W * 0.64)
    ss_y = (FEATURE_H - ss_h) // 2 + 20

    ss = fit_screenshot_in_phone(SCREENSHOTS_SRC[0], ss_w, ss_h)

    # Shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle(
        [ss_x + 4, ss_y + 8, ss_x + ss_w + 4, ss_y + ss_h + 8],
        radius=20, fill=(0, 0, 0, 100)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=12))
    canvas = canvas.convert("RGBA")
    canvas.alpha_composite(shadow)
    canvas = canvas.convert("RGB")

    mask = Image.new("L", (ss_w, ss_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, ss_w, ss_h], radius=18, fill=255)
    canvas.paste(ss, (ss_x, ss_y), mask)

    canvas.save(out_path, "PNG", optimize=True)
    print(f"  Saved: {out_path}")


def make_tablet_screenshot(src_path, out_path, size):
    """Scale a phone screenshot for tablet dimensions maintaining 16:9."""
    w, h = size
    img = Image.open(src_path)
    img_ratio = img.width / img.height
    target_ratio = w / h
    if img_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))
    img = img.resize(size, Image.LANCZOS)
    img.save(out_path, "PNG", optimize=True)
    print(f"  Saved: {out_path}")


if __name__ == "__main__":
    print("Generating phone screenshots...")
    for s in SCREENS:
        out = os.path.join(BASE, "phone_screenshots", f"phone_{s['idx']+1:02d}.png")
        make_phone_screenshot(s["verb"], s["desc"], SCREENSHOTS_SRC[s["idx"]], out)

    print("\nGenerating feature graphic...")
    make_feature_graphic(os.path.join(BASE, "feature_graphic.png"))

    print("\nGenerating tablet screenshots (7in)...")
    for i, src in enumerate(SCREENSHOTS_SRC):
        out = os.path.join(BASE, "tablet_7in", f"tablet7_{i+1:02d}.png")
        make_tablet_screenshot(src, out, (1200, 1920))

    print("\nGenerating tablet screenshots (10in)...")
    for i, src in enumerate(SCREENSHOTS_SRC):
        out = os.path.join(BASE, "tablet_10in", f"tablet10_{i+1:02d}.png")
        make_tablet_screenshot(src, out, (1600, 2560))

    print("\nDone!")
