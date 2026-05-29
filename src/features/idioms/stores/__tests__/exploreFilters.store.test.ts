import { useExploreFiltersStore } from "../exploreFilters.store";

describe("useExploreFiltersStore", () => {
  beforeEach(() => {
    useExploreFiltersStore.setState({
      selectedLanguageCodes: [],
      selectedTagKeys: [],
    });
  });

  it("toggles multiple language codes", () => {
    useExploreFiltersStore.getState().toggleLanguage("es");
    useExploreFiltersStore.getState().toggleLanguage("fr");

    expect(useExploreFiltersStore.getState().selectedLanguageCodes).toEqual([
      "es",
      "fr",
    ]);

    useExploreFiltersStore.getState().toggleLanguage("es");
    expect(useExploreFiltersStore.getState().selectedLanguageCodes).toEqual([
      "fr",
    ]);
  });

  it("toggles multiple tag keys", () => {
    useExploreFiltersStore.getState().toggleTag("food");
    useExploreFiltersStore.getState().toggleTag("informal");

    expect(useExploreFiltersStore.getState().selectedTagKeys).toEqual([
      "food",
      "informal",
    ]);

    useExploreFiltersStore.getState().toggleTag("food");
    expect(useExploreFiltersStore.getState().selectedTagKeys).toEqual([
      "informal",
    ]);
  });

  it("sets tag keys uniquely", () => {
    useExploreFiltersStore.getState().setTags(["food", "food", "luck"]);
    expect(useExploreFiltersStore.getState().selectedTagKeys).toEqual([
      "food",
      "luck",
    ]);
  });

  it("clears filter groups", () => {
    useExploreFiltersStore.setState({
      selectedLanguageCodes: ["es"],
      selectedTagKeys: ["food"],
    });

    useExploreFiltersStore.getState().clearLanguages();
    expect(useExploreFiltersStore.getState().selectedLanguageCodes).toEqual([]);
    expect(useExploreFiltersStore.getState().selectedTagKeys).toEqual(["food"]);

    useExploreFiltersStore.getState().clearTags();
    expect(useExploreFiltersStore.getState().selectedTagKeys).toEqual([]);
  });

  it("clears all filters", () => {
    useExploreFiltersStore.setState({
      selectedLanguageCodes: ["es"],
      selectedTagKeys: ["food"],
    });

    useExploreFiltersStore.getState().clearAll();
    expect(useExploreFiltersStore.getState()).toMatchObject({
      selectedLanguageCodes: [],
      selectedTagKeys: [],
    });
  });
});
