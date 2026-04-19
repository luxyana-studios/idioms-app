import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n from "@/core/i18n";
import { zustandMMKVStorage } from "@/core/storage/mmkv";
import { supabase } from "@/core/supabase/client";
import type { Idiom, IdiomTag } from "../types";

const MOCK_IDIOMS: Idiom[] = [
  {
    id: "mock-1",
    expression: "Break the ice",
    languageCode: "en",
    idiomaticMeaning:
      "To initiate conversation in a socially awkward situation",
    explanation:
      "Originally a nautical term — icebreaker ships would clear frozen waterways to open trade routes. By the 17th century it had shifted to mean clearing social tension before negotiations or meetings.",
    examples: [
      "She broke the ice at the party by telling a funny story about her cat.",
    ],
    tags: ["Social", "English"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-2",
    expression: "Bite the bullet",
    languageCode: "en",
    idiomaticMeaning: "To endure a painful or difficult situation",
    explanation:
      "Dating back to battlefield surgery before anesthesia, soldiers were given a bullet to bite on to endure the pain of operations. The physical act became a metaphor for stoic endurance.",
    examples: [
      "I hated going to the dentist but I bit the bullet and made the appointment.",
    ],
    tags: ["Courage", "English"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-3",
    expression: "Casser les pieds",
    languageCode: "fr",
    idiomaticMeaning: "To annoy someone intensely",
    explanation:
      "Literally 'to break someone's feet', this French expression evokes the persistent, grinding nature of extreme annoyance — as if someone were stomping on your feet repeatedly.",
    examples: [
      "Tu me casses les pieds avec tes questions ! — You're really getting on my nerves with your questions!",
    ],
    tags: ["Emotions", "French"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-4",
    expression: "Spill the beans",
    languageCode: "en",
    idiomaticMeaning: "To reveal secret or confidential information",
    explanation:
      "Ancient Greek voting used beans — white beans for yes, black for no. Accidentally knocking over the jar would reveal the vote count before the official count. Leaking information became 'spilling the beans.'",
    examples: ["Who spilled the beans about the surprise party?"],
    tags: ["Secrets", "English"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-5",
    expression: "Ins Fettnäpfchen treten",
    languageCode: "de",
    idiomaticMeaning: "To put your foot in it; to commit a social blunder",
    explanation:
      "Literally 'to step into the grease bowl.' In old German farmhouses, a small bowl of grease sat near the door to lubricate boots. Stepping into it was messy and embarrassing — a perfect metaphor for social gaffes.",
    examples: [
      "Mit seinem Kommentar ist er ins Fettnäpfchen getreten. — With his comment he really put his foot in it.",
    ],
    tags: ["Social", "German"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-6",
    expression: "Hit the sack",
    languageCode: "en",
    idiomaticMeaning: "To go to bed",
    explanation:
      "In the early 1900s, mattresses were often burlap sacks stuffed with straw or hay. Going to bed literally meant hitting the sack. The phrase stuck long after proper mattresses became standard.",
    examples: ["I'm exhausted — I'm going to hit the sack early tonight."],
    tags: ["Daily life", "Slang"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-7",
    expression: "No hay mal que por bien no venga",
    languageCode: "es",
    idiomaticMeaning: "Every cloud has a silver lining",
    explanation:
      "Literally 'there is no bad from which good does not come.' This Spanish proverb reflects the Mediterranean philosophical tradition of finding redemption in adversity.",
    examples: [
      "Perdí ese trabajo pero encontré uno mejor — no hay mal que por bien no venga.",
    ],
    tags: ["Wisdom", "Spanish"],
    source: "human",
    status: "published",
  },
  {
    id: "mock-8",
    expression: "Burn the midnight oil",
    languageCode: "en",
    idiomaticMeaning: "To work late into the night",
    explanation:
      "Before electricity, oil lamps were the only way to work after dark. Burning lamp oil past midnight was a deliberate, costly choice — signaling serious dedication to the task at hand.",
    examples: [
      "She's been burning the midnight oil to finish her thesis before the deadline.",
    ],
    tags: ["Work", "English"],
    source: "human",
    status: "published",
  },
];

interface IdiomsState {
  idioms: Idiom[];
  savedIds: string[];
  currentIndex: number;
  loading: boolean;
  loadIdioms: () => Promise<void>;
  saveIdiom: (id: string) => void;
  unsaveIdiom: (id: string) => void;
  nextIdiom: () => void;
  isSaved: (id: string) => boolean;
}

type IdiomTagsJoin = Array<{
  tags: {
    key: string;
    facet: string;
    tag_translations: Array<{ language_code: string; label: string }>;
  } | null;
}>;

// Resolve the display label per tag: UI language → EN fallback → canonical key.
const resolveTags = (
  joins: IdiomTagsJoin | null,
  uiLanguage: string,
): IdiomTag[] =>
  (joins ?? []).flatMap((row) => {
    const t = row.tags;
    if (!t) return [];
    const translations = t.tag_translations;
    const label =
      translations.find((tr) => tr.language_code === uiLanguage)?.label ??
      translations.find((tr) => tr.language_code === "en")?.label ??
      t.key;
    return [{ key: t.key, facet: t.facet, label }];
  });

export const useIdiomsStore = create<IdiomsState>()(
  persist(
    (set, get) => ({
      idioms: [],
      savedIds: [],
      currentIndex: 0,
      loading: false,

      loadIdioms: async () => {
        if (get().idioms.length > 0 || get().loading) return;
        set({ loading: true });

        const { data, error } = await supabase
          .from("idioms")
          .select(
            `
            id,
            expression,
            language_code,
            idiomatic_meaning,
            explanation,
            examples,
            source,
            status,
            idiom_tags (
              tags (
                key,
                facet,
                tag_translations ( language_code, label )
              )
            )
          `,
          )
          .eq("status", "published");

        if (error) {
          // Supabase not configured — fall back to mock data
          set({ idioms: MOCK_IDIOMS, loading: false });
          return;
        }

        const uiLanguage = i18n.language;
        const idioms: Idiom[] = (data ?? []).map((row) => ({
          id: row.id,
          expression: row.expression,
          languageCode: row.language_code,
          idiomaticMeaning: row.idiomatic_meaning,
          explanation: row.explanation ?? undefined,
          examples: row.examples ?? undefined,
          tags: resolveTags(row.idiom_tags, uiLanguage),
          source: row.source as Idiom["source"],
          status: row.status as Idiom["status"],
        }));

        set({
          idioms: idioms.length > 0 ? idioms : MOCK_IDIOMS,
          loading: false,
        });
      },

      saveIdiom: (id) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id)
            ? state.savedIds
            : [...state.savedIds, id],
        })),

      unsaveIdiom: (id) =>
        set((state) => ({
          savedIds: state.savedIds.filter((s) => s !== id),
        })),

      nextIdiom: () =>
        set((state) => ({
          currentIndex: (state.currentIndex + 1) % state.idioms.length,
        })),

      isSaved: (id) => get().savedIds.includes(id),
    }),
    {
      name: "idioms-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ savedIds: state.savedIds }) as IdiomsState,
    },
  ),
);
