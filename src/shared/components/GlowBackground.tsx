import { useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";

interface GlowBackgroundProps {
  subtle?: boolean;
}

export function GlowBackground({ subtle = false }: GlowBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";

  const r1 = subtle ? 140 : 220;
  const r2 = subtle ? 120 : 200;
  const blur1 = subtle ? 50 : 70;
  const blur2 = subtle ? 45 : 65;

  // Dark mode: much lower opacity so blobs diffuse into the background naturally
  const opacity1 = isDark ? (subtle ? "22" : "30") : subtle ? "55" : "88";
  const opacity2 = isDark ? (subtle ? "1a" : "28") : subtle ? "45" : "72";

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Filter id="blurBg1" x="-100%" y="-100%" width="300%" height="300%">
            <FeGaussianBlur stdDeviation={blur1} />
          </Filter>
          <Filter id="blurBg2" x="-100%" y="-100%" width="300%" height="300%">
            <FeGaussianBlur stdDeviation={blur2} />
          </Filter>
        </Defs>
        <Circle
          cx={width}
          cy={0}
          r={r1}
          fill={`${theme.colors.blob1}${opacity1}`}
          filter="url(#blurBg1)"
        />
        <Circle
          cx={0}
          cy={height}
          r={r2}
          fill={`${theme.colors.blob2}${opacity2}`}
          filter="url(#blurBg2)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
