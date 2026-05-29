import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { PickerSheet } from "@/shared/components/PickerSheet";
import { LANGUAGE_SWATCHES } from "../constants";

interface ColorSwatchPickerProps {
  visible: boolean;
  selectedColor?: string;
  onPick: (color: string) => void;
  onClose: () => void;
}

export function ColorSwatchPicker({
  visible,
  selectedColor,
  onPick,
  onClose,
}: ColorSwatchPickerProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <PickerSheet
      visible={visible}
      title={t("languages.pickColor")}
      onClose={onClose}
    >
      <View style={styles.grid}>
        {LANGUAGE_SWATCHES.map((color) => {
          const isActive = selectedColor?.toLowerCase() === color.toLowerCase();
          return (
            <Pressable
              key={color}
              style={[styles.swatch, { backgroundColor: color }]}
              onPress={() => {
                onPick(color);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={color}
              accessibilityState={{ selected: isActive }}
            >
              {isActive && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primaryText}
                />
              )}
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
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  swatch: {
    width: theme.spacing["2xl"],
    height: theme.spacing["2xl"],
    borderRadius: theme.radius.full,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
}));
