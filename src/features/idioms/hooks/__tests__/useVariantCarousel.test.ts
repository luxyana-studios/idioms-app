import { act, renderHook } from "@testing-library/react-native";
import type { Idiom, IdiomEquivalent } from "../../types";
import { useVariantCarousel } from "../useVariantCarousel";

const makeEquivalent = (
  id: string,
  overrides: Partial<IdiomEquivalent> = {},
): IdiomEquivalent => ({
  edgeId: `edge-${id}`,
  equivalentId: id,
  expression: `expr-${id}`,
  languageCode: "de",
  idiomaticMeaning: `meaning-${id}`,
  similarityScore: 0.8,
  verified: true,
  ...overrides,
});

const makeIdiom = (overrides: Partial<Idiom> = {}): Idiom => ({
  id: "base",
  expression: "base expression",
  languageCode: "en",
  idiomaticMeaning: "base meaning",
  likesCount: 0,
  tags: [{ key: "courage", facet: "meaning", label: "Courage" }],
  translations: [],
  equivalents: [],
  source: "human",
  status: "published",
  ...overrides,
});

describe("useVariantCarousel", () => {
  it("derives variants from idiom.equivalents with the base idiom first", async () => {
    const idiom = makeIdiom({
      equivalents: [makeEquivalent("eq-1"), makeEquivalent("eq-2")],
    });

    const { result } = await renderHook(() => useVariantCarousel(idiom));

    expect(result.current.variants).toHaveLength(3);
    expect(result.current.variants[0]).toMatchObject({
      id: "base",
      expression: "base expression",
      tags: idiom.tags,
    });
    expect(result.current.variants.slice(1).map((v) => v.id)).toEqual([
      "eq-1",
      "eq-2",
    ]);
    expect(result.current.variants[1].tags).toEqual([]);
  });

  it("returns only the base variant when there are no equivalents", async () => {
    const { result } = await renderHook(() => useVariantCarousel(makeIdiom()));

    expect(result.current.variants).toHaveLength(1);
    expect(result.current.currentVariant.id).toBe("base");
  });

  it("clamps navigation within bounds", async () => {
    const idiom = makeIdiom({ equivalents: [makeEquivalent("eq-1")] });
    const { result } = await renderHook(() => useVariantCarousel(idiom));

    await act(() => result.current.handlePrev());
    expect(result.current.variantIndex).toBe(0);

    await act(() => result.current.handleNext());
    expect(result.current.variantIndex).toBe(1);

    await act(() => result.current.handleNext());
    expect(result.current.variantIndex).toBe(1);
  });

  it("resets to the base variant when the idiom id changes", async () => {
    const first = makeIdiom({ id: "a", equivalents: [makeEquivalent("eq-1")] });
    const second = makeIdiom({
      id: "b",
      equivalents: [makeEquivalent("eq-2")],
    });

    const { result, rerender } = await renderHook(
      ({ idiom }: { idiom: Idiom }) => useVariantCarousel(idiom),
      { initialProps: { idiom: first } },
    );

    await act(() => result.current.handleNext());
    expect(result.current.variantIndex).toBe(1);

    await rerender({ idiom: second });
    expect(result.current.variantIndex).toBe(0);
  });
});
