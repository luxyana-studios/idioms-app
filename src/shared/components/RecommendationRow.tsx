import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "./Typography";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface RecommendationRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  variant?: "default" | "accent";
  accessibilityLabel?: string;
}

export function RecommendationRow({
  icon,
  title,
  subtitle,
  onPress,
  variant = "default",
  accessibilityLabel,
}: RecommendationRowProps) {
  const { theme } = useUnistyles();
  const isAccent = variant === "accent";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <View
        style={[
          styles.card,
          isAccent && {
            backgroundColor: theme.colors.primary,
            borderColor: "transparent",
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isAccent
                ? "rgba(255,255,255,0.20)"
                : theme.colors.surfaceContainerHighest,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={
              isAccent ? theme.colors.primaryText : theme.colors.textSecondary
            }
          />
        </View>
        <View style={styles.text}>
          <Typography
            variant="label"
            weight="bold"
            style={{
              color: isAccent ? theme.colors.primaryText : theme.colors.text,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            style={{
              color: isAccent
                ? theme.colors.primaryText
                : theme.colors.textMuted,
              opacity: isAccent ? 0.75 : 1,
            }}
          >
            {subtitle}
          </Typography>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isAccent ? theme.colors.primaryText : theme.colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: 2,
  },
}));
