import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { FLAG_OPTIONS } from "../constants";
import { PickerSheet } from "./PickerSheet";

interface FlagPickerProps {
  visible: boolean;
  selectedFlag?: string;
  onPick: (flag: string) => void;
  onClose: () => void;
}

export function FlagPicker({
  visible,
  selectedFlag,
  onPick,
  onClose,
}: FlagPickerProps) {
  const { t } = useTranslation();

  return (
    <PickerSheet
      visible={visible}
      title={t("languages.pickFlag")}
      onClose={onClose}
    >
      <View style={styles.grid}>
        {FLAG_OPTIONS.map((flag) => {
          const isActive = selectedFlag === flag;
          return (
            <Pressable
              key={flag}
              style={[styles.cell, isActive && styles.cellActive]}
              onPress={() => {
                onPick(flag);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={flag}
              accessibilityState={{ selected: isActive }}
            >
              {/* Raw Text is intentional: emoji glyphs render via the system
                  font, and Typography would impose the DM Sans family. */}
              <Text style={styles.glyph}>{flag}</Text>
            </Pressable>
          );
        })}
      </View>
    </PickerSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  cell: {
    width: theme.spacing.touchTarget,
    height: theme.spacing.touchTarget,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cellActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  glyph: {
    fontSize: theme.typography.sizes["2xl"],
  },
}));
