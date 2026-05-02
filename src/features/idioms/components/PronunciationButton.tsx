import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

export function PronunciationButton() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled
      accessibilityLabel={t("home.playPronunciation")}
      style={[
        styles.btn,
        { backgroundColor: theme.colors.primary, opacity: 0.6 },
      ]}
    >
      <Ionicons
        name="volume-medium"
        size={20}
        color={theme.colors.primaryText}
      />
      <Typography
        variant="label"
        weight="bold"
        style={{ color: theme.colors.primaryText, letterSpacing: 0.5 }}
      >
        {t("home.playPronunciation")}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
}));
