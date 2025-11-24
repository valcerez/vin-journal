import { useCallback, useState, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Region } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { palette, radii, spacing, typography } from "../styles/theme";
import { BottleCard } from "../components/BottleCard";
import { MapBottle } from "../types/bottle";
import { WineMap, MapRef } from "../components/WineMap";

const DEFAULT_REGION: Region = {
  latitude: 46.2276, // France center
  longitude: 2.2137,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export default function MapScreen() {
  const [points, setPoints] = useState<MapBottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBottle, setSelectedBottle] = useState<MapBottle | null>(null);
  const mapRef = useRef<MapRef>(null);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bottles")
      .select("id,name,latitude,longitude,image_url,vintage,rating,notes,region,location")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (!error && data) {
      setPoints(data as MapBottle[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPoints();
    }, [loadPoints]),
  );

  const handleMarkerPress = (bottle: MapBottle) => {
    setSelectedBottle(bottle);
    mapRef.current?.animateToRegion({
      latitude: bottle.latitude!,
      longitude: bottle.longitude!,
      latitudeDelta: 1,
      longitudeDelta: 1,
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.accent} />
        <Text style={styles.centerText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Carte des Vins</Text>
        <Text style={styles.subtitle}>Explore tes dégustations.</Text>
      </View>

      <View style={styles.mapWrapper}>
        <WineMap
          ref={mapRef}
          points={points}
          onMarkerPress={handleMarkerPress}
          initialRegion={DEFAULT_REGION}
        />

        {/* Overlay for selected bottle */}
        {selectedBottle && (
          <View style={styles.cardOverlay}>
            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedBottle(null)}
              >
                <Ionicons name="close-circle" size={30} color={palette.text} />
              </TouchableOpacity>
              <BottleCard item={selectedBottle} />
            </View>
          </View>
        )}

        {!selectedBottle && (
          <View style={styles.legendCard}>
            <Ionicons name="map-outline" size={20} color={palette.accent} />
            <Text style={styles.legendText}>
              Touche un marqueur pour voir le vin.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 24,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.primaryDark,
    backgroundColor: palette.surface,
  },
  legendCard: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(18, 6, 12, 0.9)",
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    color: palette.text,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  centerText: {
    color: palette.mutedText,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cardContainer: {
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 10,
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
  },
});
