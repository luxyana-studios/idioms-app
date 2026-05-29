import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { FlagPicker } from "./FlagPicker";
import {
  LanguageAppearanceControls,
  LanguageRowBody,
  languageDisplayRowStyles,
} from "./LanguageDisplayRow";

interface LanguageConfigRowProps {
  code: string;
  label: string;
  isSelected: boolean;
  color: string;
  flag: string;
  onToggle: (code: string) => void;
  onSetColor: (code: string, color: string) => void;
  onSetFlag: (code: string, flag: string) => void;
  onDragByRows: (code: string, rowDelta: number) => void;
}

function LanguageConfigRowComponent({
  code,
  label,
  isSelected,
  color,
  flag,
  onToggle,
  onSetColor,
  onSetFlag,
  onDragByRows,
}: LanguageConfigRowProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [colorOpen, setColorOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const rowHeight = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const handleLayout = (event: LayoutChangeEvent) => {
    rowHeight.current = event.nativeEvent.layout.height;
  };
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isSelected,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          isSelected && Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => setIsDragging(true),
        onPanResponderMove: (_event, gesture) => {
          translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          setIsDragging(false);
          const rowDelta =
            rowHeight.current > 0
              ? Math.round(gesture.dy / rowHeight.current)
              : 0;
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          if (rowDelta !== 0) {
            onDragByRows(code, rowDelta);
          }
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [code, isSelected, onDragByRows, translateY],
  );

  return (
    <Animated.View
      style={[
        languageDisplayRowStyles.row,
        isDragging && styles.dragging,
        { transform: [{ translateY }] },
      ]}
      onLayout={handleLayout}
    >
      <TouchableOpacity
        style={languageDisplayRowStyles.pressableContent}
        onPress={() => onToggle(code)}
        activeOpacity={0.75}
      >
        <LanguageRowBody
          label={label}
          leading={
            <View
              style={styles.toggle}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={label}
            >
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={
                  isSelected ? theme.colors.primary : theme.colors.textMuted
                }
              />
            </View>
          }
        />
      </TouchableOpacity>

      <LanguageAppearanceControls
        flag={flag}
        color={color}
        inactive={!isSelected}
        flagControl={
          isSelected ? (
            <Pressable
              style={styles.flagBtn}
              onPress={() => setFlagOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t("languages.pickFlag")}
              hitSlop={8}
            >
              <Text style={styles.flagGlyph}>{flag}</Text>
            </Pressable>
          ) : undefined
        }
        colorControl={
          isSelected ? (
            <Pressable
              style={[styles.colorDot, { backgroundColor: color }]}
              onPress={() => setColorOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t("languages.pickColor")}
              hitSlop={8}
            />
          ) : undefined
        }
        trailing={
          isSelected ? (
            <View
              style={styles.dragHandle}
              accessibilityRole="adjustable"
              accessibilityLabel={t("languages.dragToReorder")}
              {...panResponder.panHandlers}
            >
              <Ionicons
                name="reorder-three-outline"
                size={24}
                color={theme.colors.textMuted}
              />
            </View>
          ) : undefined
        }
      />

      <ColorSwatchPicker
        visible={colorOpen}
        selectedColor={color}
        onPick={(picked) => onSetColor(code, picked)}
        onClose={() => setColorOpen(false)}
      />
      <FlagPicker
        visible={flagOpen}
        selectedFlag={flag}
        onPick={(picked) => onSetFlag(code, picked)}
        onClose={() => setFlagOpen(false)}
      />
    </Animated.View>
  );
}

export const LanguageConfigRow = memo(LanguageConfigRowComponent);

const styles = StyleSheet.create((theme) => ({
  dragging: {
    opacity: 0.85,
    zIndex: 2,
  },
  toggle: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  flagBtn: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  flagGlyph: {
    fontSize: theme.typography.sizes.xl,
  },
  colorDot: {
    width: theme.spacing.lg,
    height: theme.spacing.lg,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.xs,
  },
  dragHandle: {
    width: theme.spacing.xl,
    height: theme.spacing.xl,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
}));
