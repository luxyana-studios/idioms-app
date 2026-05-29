import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "./Typography";

interface PickerSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Bottom-sheet scaffold (backdrop + handle + title) for simple pickers.
// The backdrop is a sibling of the sheet, not a parent, to avoid nested
// <button> output on RN Web when picker options are Pressables.
export function PickerSheet({
  visible,
  title,
  onClose,
  children,
}: PickerSheetProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + theme.spacing.md },
          ]}
        >
          <View style={styles.handle} />
          <Typography variant="heading" style={styles.title}>
            {title}
          </Typography>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    justifyContent: "flex-end" as const,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.scrim,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    maxHeight: "80%" as const,
  },
  handle: {
    width: theme.spacing["2xl"],
    height: theme.spacing.xs,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    alignSelf: "center" as const,
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
}));
