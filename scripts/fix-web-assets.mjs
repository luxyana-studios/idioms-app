// Post-process `expo export --platform web` output for Cloudflare Pages.
//
// Expo emits bundled assets under `dist/assets/node_modules/...` (e.g. the
// Manrope text fonts and the Ionicons glyph font). Cloudflare Pages strips any
// `node_modules` directory from the uploaded output, so those files 404 on the
// deployed site, fall through to the SPA `index.html` fallback, and the browser
// font sanitizer rejects the HTML-as-font — every icon and text font silently
// disappears with no JS error.
//
// Fix: relocate `assets/node_modules` -> `assets/vendor` and rewrite every
// reference in the JS bundles. Hashed filenames are preserved, so caching and
// integrity are unaffected.

import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");
const FROM = "assets/node_modules";
const TO = "assets/vendor";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

async function main() {
  // 1. Move the directory out of a `node_modules` path.
  await rename(join(DIST, FROM), join(DIST, TO));

  // 2. Rewrite references in every emitted JS bundle.
  const jsDir = join(DIST, "_expo/static/js/web");
  const files = await walk(jsDir);
  let patched = 0;
  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const original = await readFile(file, "utf8");
    if (!original.includes(FROM)) continue;
    await writeFile(file, original.split(FROM).join(TO));
    patched += 1;
  }

  console.log(`fix-web-assets: moved ${FROM} -> ${TO}, patched ${patched} bundle(s)`);
}

main().catch((err) => {
  console.error("fix-web-assets failed:", err);
  process.exit(1);
});
