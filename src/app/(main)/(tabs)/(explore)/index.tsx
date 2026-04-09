import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { supabase } from "@/core/supabase/client";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

interface ExploreItem {
  id: string;
  title: string;
}

async function fetchItems(): Promise<ExploreItem[]> {
  const { data, error } = await supabase.from("items").select("id, title");
  if (error) throw error;
  return (data as ExploreItem[]) ?? [];
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["explore-items"],
    queryFn: fetchItems,
  });

  return (
    <ScreenContainer style={styles.container}>
      <FlashList
        data={data ?? []}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Typography variant="body">{item.title}</Typography>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Typography
              variant="body"
              color="textSecondary"
              style={styles.empty}
            >
              {t("explore.empty")}
            </Typography>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 0,
  },
  item: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  empty: {
    textAlign: "center" as const,
    marginTop: theme.spacing["2xl"],
  },
}));
