import { useCallback, useState } from "react";
import { View, Text, FlatList, Image, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { palette, radii, spacing, typography } from "../styles/theme";
import { WineButton } from "../components/WineButton";

type BottleRow = {
  id: string;
  image_url: string | null;
  name: string | null;
  vintage: string | null;
  rating: number | null;
  notes: string | null;
  region: string | null;
  location: string | null;
  created_at: string;
  // Legacy fallbacks for display if migration didn't run perfectly or for old data
  producer?: string | null;
  cuvee?: string | null;
};

export default function HistoryScreen() {
  const [rows, setRows] = useState<BottleRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRows = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("bottles")
      .select("id,image_url,name,vintage,rating,notes,region,location,created_at")
      .order("created_at", { ascending: false });

    if (!error && data) setRows(data as BottleRow[]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRows();
    }, [loadRows]),
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRows} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Cave personnelle</Text>
              <Text style={styles.headerSubtitle}>
                {rows.length ? `${rows.length} souvenirs liquides.` : "Enregistre ta première bouteille."}
              </Text>
            </View>
            <WineButton
              title="Déconnexion"
              variant="ghost"
              onPress={() => supabase.auth.signOut()}
              icon={<Ionicons name="exit-outline" size={18} color={palette.accent} />}
              textStyle={{ color: palette.accent }}
            />
          </View>
        }
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                  <Ionicons name="wine-outline" size={24} color={palette.mutedText} />
                </View>
              )}

              <View style={styles.details}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.producer}>{item.name || "Vin inconnu"}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#1b0b12" />
                    <Text style={styles.ratingText}>{item.rating ?? "?"}/10</Text>
                  </View>
                </View>

                <Text style={styles.meta}>
                  {item.vintage || "NV"} · {item.region || "Région inconnue"}
                </Text>

                {item.location ? (
                  <Text style={styles.location}>
                    <Ionicons name="location-outline" size={12} color={palette.mutedText} /> {item.location}
                  </Text>
                ) : null}

                {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={40} color={palette.mutedText} />
            <Text style={styles.emptyText}>Aucune bouteille enregistrée pour le moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 24,
  },
  headerSubtitle: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  card: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 110,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: palette.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  producer: {
    color: palette.text,
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  ratingText: {
    marginLeft: spacing.xs / 2,
    color: "#1b0b12",
    fontWeight: "600",
    fontSize: 12,
  },
  meta: {
    color: palette.mutedText,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  location: {
    color: palette.mutedText,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  notes: {
    color: palette.text,
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  empty: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: palette.mutedText,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
