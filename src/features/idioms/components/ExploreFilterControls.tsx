import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useUiFonts } from "@/core/theme/fonts";
import type { EffectiveUserLanguage } from "@/features/languages/types";
import { Typography } from "@/shared/components/Typography";
import type { IdiomTag } from "../types";

interface ExploreFilterControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  languages: EffectiveUserLanguage[];
  selectedLanguageCodes: string[];
  selectedTagKeys: string[];
  tags: IdiomTag[];
  onToggleLanguage: (code: string) => void;
  onToggleTag: (key: string) => void;
  onClearLanguages: () => void;
  onClearTags: () => void;
}

export function ExploreFilterControls({
  search,
  onSearchChange,
  languages,
  selectedLanguageCodes,
  selectedTagKeys,
  tags,
  onToggleLanguage,
  onToggleTag,
  onClearLanguages,
  onClearTags,
}: ExploreFilterControlsProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const fonts = useUiFonts();

  return (
    <View>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.glassSurface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.textMuted}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              fontFamily: fonts.family("regular"),
              fontWeight: fonts.weight("regular"),
            },
          ]}
          placeholder={t("explore.search")}
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => onSearchChange("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("explore.clearSearch")}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      <LanguageFlagRow
        languages={languages}
        selectedCodes={selectedLanguageCodes}
        onToggle={onToggleLanguage}
        onClear={onClearLanguages}
      />

      <ChipFilterRow
        allSelected={selectedTagKeys.length === 0}
        onClear={onClearTags}
      >
        {tags.map((tag) => (
          <FilterChip
            key={tag.key}
            label={tag.label}
            isActive={selectedTagKeys.includes(tag.key)}
            onPress={() => onToggleTag(tag.key)}
          />
        ))}
      </ChipFilterRow>
    </View>
  );
}

interface LanguageFlagRowProps {
  languages: ExploreFilterControlsProps["languages"];
  selectedCodes: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}

function LanguageFlagRow({
  languages,
  selectedCodes,
  onToggle,
  onClear,
}: LanguageFlagRowProps) {
  const { t } = useTranslation();
  const allSelected = selectedCodes.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chipsContent}
    >
      <FilterChip
        label={t("explore.filterAll")}
        isActive={allSelected}
        onPress={onClear}
      />
      {languages.map((language) => (
        <LangPillChip
          key={language.languageCode}
          flag={language.flag}
          code={language.languageCode.slice(0, 2).toUpperCase()}
          isActive={selectedCodes.includes(language.languageCode)}
          onPress={() => onToggle(language.languageCode)}
          accessibilityLabel={t(`lang.${language.languageCode}`, {
            defaultValue: language.languageCode.toUpperCase(),
          })}
        />
      ))}
    </ScrollView>
  );
}

interface LangPillChipProps {
  flag: string;
  code: string;
  isActive: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

function LangPillChip({
  flag,
  code,
  isActive,
  onPress,
  accessibilityLabel,
}: LangPillChipProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.langPill,
        isActive
          ? { backgroundColor: theme.colors.primary }
          : {
              backgroundColor: theme.colors.chipBg,
              borderColor: theme.colors.chipBorder,
            },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Typography style={styles.langPillFlag}>{flag}</Typography>
      <Typography
        variant="caption"
        weight="bold"
        style={{
          color: isActive ? theme.colors.primaryText : theme.colors.primary,
          fontSize: 12,
        }}
      >
        {code}
      </Typography>
    </Pressable>
  );
}

interface ChipFilterRowProps {
  allSelected: boolean;
  onClear: () => void;
  children: ReactNode;
}

function ChipFilterRow({ allSelected, onClear, children }: ChipFilterRowProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chipsContent}
    >
      <FilterChip
        label={t("explore.filterAll")}
        isActive={allSelected}
        onPress={onClear}
      />
      {children}
    </ScrollView>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: theme.colors.primary }
          : {
              backgroundColor: theme.colors.chipBg,
              borderColor: theme.colors.chipBorder,
            },
      ]}
    >
      <Typography
        variant="caption"
        weight="bold"
        style={{
          color: isActive ? theme.colors.primaryText : theme.colors.primary,
          fontSize: 12,
        }}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: theme.spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  langPillFlag: {
    fontSize: 17,
    lineHeight: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
}));
