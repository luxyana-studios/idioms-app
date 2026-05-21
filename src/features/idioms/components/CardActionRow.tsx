import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DirectionalIcon } from "@/shared/components/DirectionalIcon";

interface CardActionRowProps {
  isLiked: boolean;
  onSkip: () => void;
  onDetails: () => void;
  onToggleLike: () => void;
  disabled?: boolean;
}

export function CardActionRow({
  isLiked,
  onSkip,
  onDetails,
  onToggleLike,
  disabled,
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
        <DirectionalIcon
          name="chevron-forward"
          size={18}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btnLg,
          isLiked
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
        onPress={onToggleLike}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t(isLiked ? "common.unlike" : "common.like")}
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={24}
          color={isLiked ? theme.colors.primaryText : theme.colors.primary}
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
    gap: theme.spacing.lg,
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
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.outline,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
}));
