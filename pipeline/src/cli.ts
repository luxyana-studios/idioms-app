import { runDiscover } from "./jobs/discover.js";
import { runEnrich } from "./jobs/enrich.js";
import { runMine } from "./jobs/mine.js";
import { runSeedTagTranslations } from "./jobs/seedTagTranslations.js";
import { runTag } from "./jobs/tag.js";
import { runTranslate } from "./jobs/translate.js";
import { runVerify } from "./jobs/verify.js";
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
  console.error("usage:");
  console.error("  pipeline mine     --lang <en|es|de|fr> [--count <n>]");
  console.error(
    "  pipeline discover [--top-n <n>] [--per-lang-cap <n>] [--max-iter <n>] [--concurrency <n>]",
  );
  console.error("  pipeline enrich    [--concurrency <n>]");
  console.error(
    "  pipeline translate --lang <en|es|de|fr> [--concurrency <n>]",
  );
  console.error("  pipeline seed-tag-translations");
  console.error("  pipeline tag       [--concurrency <n>]");
  console.error(
    "  pipeline verify    [--lang <en|es|de|fr>] [--source <ai_mined|all>] [--concurrency <n>] [--dry-run]",
  );
  process.exit(1);
}

function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) usage();
  return n;
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const flags = parseFlags(rest);

  switch (command) {
    case "mine": {
      const lang = flags.lang;
      if (!lang || !isLanguage(lang)) usage();
      const count = optionalNumber(flags.count) ?? 50;
      await runMine({ language: lang, count });
      return;
    }
    case "discover": {
      await runDiscover({
        topN: optionalNumber(flags["top-n"]),
        perLanguageCap: optionalNumber(flags["per-lang-cap"]),
        maxIterations: optionalNumber(flags["max-iter"]),
        expressionConcurrency: optionalNumber(flags.concurrency),
      });
      return;
    }
    case "enrich": {
      await runEnrich({ concurrency: optionalNumber(flags.concurrency) });
      return;
    }
    case "translate": {
      const lang = flags.lang;
      if (!lang || !isLanguage(lang)) usage();
      await runTranslate({
        targetLanguage: lang,
        concurrency: optionalNumber(flags.concurrency),
      });
      return;
    }
    case "seed-tag-translations": {
      await runSeedTagTranslations();
      return;
    }
    case "tag": {
      await runTag({ concurrency: optionalNumber(flags.concurrency) });
      return;
    }
    case "verify": {
      const lang = flags.lang;
      const source = flags.source;
      if (source !== undefined && source !== "ai_mined" && source !== "all") {
        usage();
      }
      await runVerify({
        language: lang && isLanguage(lang) ? lang : undefined,
        source: (source as "ai_mined" | "all" | undefined) ?? "ai_mined",
        concurrency: optionalNumber(flags.concurrency),
        dryRun: flags["dry-run"] === "true",
      });
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
