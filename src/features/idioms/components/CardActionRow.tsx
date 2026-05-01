import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface CardActionRowProps {
  isSaved: boolean;
  onSkip: () => void;
  onDetails: () => void;
  onSave: () => void;
}

export function CardActionRow({
  isSaved,
  onSkip,
  onDetails,
  onSave,
}: CardActionRowProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.btnLg}
        onPress={onSkip}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("home.skip")}
      >
        <Ionicons
          name="close-circle-outline"
          size={24}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSm}
        onPress={onDetails}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("home.idiomDetails")}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btnLg,
          isSaved
            ? {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }
            : {
                backgroundColor: theme.colors.glassBtn,
                borderColor: theme.colors.primary,
              },
        ]}
        onPress={onSave}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t(isSaved ? "home.saved" : "common.save")}
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={24}
          color={isSaved ? theme.colors.primaryText : theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  btnLg: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.glassBtn,
  },
  btnSm: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.outline,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
}));
