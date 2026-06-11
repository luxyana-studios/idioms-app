import { useOnboardingStore } from "../onboarding.store";

jest.mock("@/core/storage/mmkv", () => ({
  zustandMMKVStorage: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe("useOnboardingStore", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      completed: false,
      goals: [],
      selectedLanguageCodes: [],
    });
  });

  it("starts with defaults", () => {
    const { completed, goals, selectedLanguageCodes } =
      useOnboardingStore.getState();
    expect(completed).toBe(false);
    expect(goals).toEqual([]);
    expect(selectedLanguageCodes).toEqual([]);
  });

  it("setGoals updates goals", () => {
    useOnboardingStore.getState().setGoals(["fun", "travel"]);
    expect(useOnboardingStore.getState().goals).toEqual(["fun", "travel"]);
  });

  it("setSelectedLanguageCodes updates codes", () => {
    useOnboardingStore.getState().setSelectedLanguageCodes(["en", "es"]);
    expect(useOnboardingStore.getState().selectedLanguageCodes).toEqual([
      "en",
      "es",
    ]);
  });

  it("complete marks completed as true", () => {
    useOnboardingStore.getState().complete();
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it("toggleGoal adds a goal when not present", () => {
    useOnboardingStore.getState().toggleGoal("fun");
    expect(useOnboardingStore.getState().goals).toEqual(["fun"]);
  });

  it("toggleGoal removes a goal when already present", () => {
    useOnboardingStore.setState({ goals: ["fun", "travel"] });
    useOnboardingStore.getState().toggleGoal("fun");
    expect(useOnboardingStore.getState().goals).toEqual(["travel"]);
  });

  it("toggleLanguage adds a code when not present", () => {
    useOnboardingStore.getState().toggleLanguage("en");
    expect(useOnboardingStore.getState().selectedLanguageCodes).toEqual(["en"]);
  });

  it("toggleLanguage removes a code when already present", () => {
    useOnboardingStore.setState({ selectedLanguageCodes: ["en", "es"] });
    useOnboardingStore.getState().toggleLanguage("en");
    expect(useOnboardingStore.getState().selectedLanguageCodes).toEqual(["es"]);
  });

  it("reset restores defaults", () => {
    useOnboardingStore.setState({
      completed: true,
      goals: ["fun"],
      selectedLanguageCodes: ["en"],
    });
    useOnboardingStore.getState().reset();
    const { completed, goals, selectedLanguageCodes } =
      useOnboardingStore.getState();
    expect(completed).toBe(false);
    expect(goals).toEqual([]);
    expect(selectedLanguageCodes).toEqual([]);
  });
});
