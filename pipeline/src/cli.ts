import { runMine } from "./jobs/mine.js";
import { isLanguage } from "./types.js";

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
    } else {
      flags[key] = next;
      i++;
    }
  }
  return flags;
}

function usage(): never {
  console.error("usage: pipeline mine --lang <en|es|de|fr> [--count <n>]");
  process.exit(1);
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const flags = parseFlags(rest);

  switch (command) {
    case "mine": {
      const lang = flags.lang;
      if (!lang || !isLanguage(lang)) usage();
      const count = Number(flags.count ?? 50);
      if (!Number.isFinite(count) || count <= 0) usage();
      await runMine({ language: lang, count });
      return;
    }
    default:
      usage();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
