import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { supabase } from "@/core/supabase/client";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

async function fetchIdioms() {
  const { data, error } = await supabase.from("idioms").select("*");
  if (error) throw error;
  return data;
}

export default function ExploreScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["idioms"],
    queryFn: fetchIdioms,
  });

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Typography variant="body" style={styles.pre}>
          {isLoading
            ? "Loading..."
            : error
              ? `Error: ${error.message}`
              : JSON.stringify(data, null, 2)}
        </Typography>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 0,
  },
  scroll: {
    flex: 1,
    padding: theme.spacing.md,
  },
  pre: {
    fontFamily: "monospace",
    fontSize: 12,
  },
}));
