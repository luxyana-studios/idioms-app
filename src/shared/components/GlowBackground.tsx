import { useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface GlowBackgroundProps {
  subtle?: boolean;
}

/**
 * Full-screen ambient glow blobs using SVG feGaussianBlur.
 * Works identically on iOS, Android, and web.
 * - Default: same intensity as the home screen
 * - subtle: smaller/more transparent, for secondary screens
 */
export function GlowBackground({ subtle = false }: GlowBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const { theme } = useUnistyles();

  const r1 = subtle ? 100 : 130;
  const r2 = subtle ? 90 : 120;
  const blur1 = subtle ? 35 : 45;
  const blur2 = subtle ? 30 : 40;
  const opacity1 = subtle ? "38" : "55";
  const opacity2 = subtle ? "30" : "48";

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
          fill={`${theme.colors.primary}${opacity1}`}
          filter="url(#blurBg1)"
        />
        <Circle
          cx={0}
          cy={height}
          r={r2}
          fill={`${theme.colors.secondary}${opacity2}`}
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
