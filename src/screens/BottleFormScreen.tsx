import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { BottleFormState, BottleInsertPayload } from "../types/bottle";
import { enqueueBottle } from "../hooks/useOfflineQueue";
import { AddBottleStackParamList } from "../navigation/types";
import { palette, radii, spacing, typography } from "../styles/theme";
import { WineButton } from "../components/WineButton";
import { StarRating } from "../components/StarRating";
import { PlacesAutocomplete } from "../components/PlacesAutocomplete";

type Props = NativeStackScreenProps<AddBottleStackParamList, "BottleForm">;

export default function BottleFormScreen({ route, navigation }: Props) {
  const { imageUri, initialForm } = route.params;

  // Ensure initialForm has lat/lon if not present (migration safety)
  const [form, setForm] = useState<BottleFormState>({
    ...initialForm,
    latitude: initialForm.latitude ?? null,
    longitude: initialForm.longitude ?? null,
  });

  const [saving, setSaving] = useState(false);

  const canSave = Boolean(form.name && form.vintage);

  const handleFieldChange = (key: keyof BottleFormState, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlaceSelected = (details: { name: string; location: string; latitude: number; longitude: number }) => {
    setForm((prev) => ({
      ...prev,
      name: details.name,
      // We don't overwrite location (user wants it for "Where I drank it")
      // location: details.location, 
      latitude: details.latitude,
      longitude: details.longitude,
    }));
  };

  const goBackToCapture = () => {
    navigation.goBack();
  };

  const uploadImage = async (userId: string, uri: string) => {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("bottle-labels")
      .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("bottle-labels").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveBottle = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Session expirée, reconnecte-toi.");

      // Upload image first
      let publicUrl = "";
      if (imageUri) {
        publicUrl = await uploadImage(user.id, imageUri);
      }

      const payload: BottleInsertPayload = {
        user_id: user.id,
        image_url: publicUrl,
        name: form.name,
        vintage: form.vintage || null,
        region: form.region || null,
        location: form.location || null,
        rating: form.rating,
        notes: form.notes || null,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      const { error } = await supabase.from("bottles").insert(payload);
      if (error) {
        await enqueueBottle(payload);
        Alert.alert(
          "Mode hors-ligne",
          "Pas de réseau. La bouteille sera envoyée automatiquement au prochain démarrage.",
        );
        navigation.popToTop();
        return;
      }

      Alert.alert("Bouteille enregistrée 🍷", "Retrouve-la dans l’historique.");
      navigation.getParent()?.navigate("Historique" as never);
      navigation.popToTop();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Sauvegarde impossible", err.message ?? "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Détails du vin</Text>
        <WineButton
          title="Retour"
          variant="ghost"
          icon={<Ionicons name="arrow-back" size={16} color={palette.accent} />}
          onPress={goBackToCapture}
          textStyle={{ color: palette.accent }}
        />
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
      ) : null}

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Nom du vin / Château *</Text>
          <PlacesAutocomplete
            value={form.name}
            onChangeText={(text) => handleFieldChange("name", text)}
            onPlaceSelected={handlePlaceSelected}
            placeholder="Rechercher un domaine..."
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Année *</Text>
            <TextInput
              value={form.vintage}
              placeholder="2018"
              keyboardType="numeric"
              placeholderTextColor={palette.mutedText}
              onChangeText={(value) => handleFieldChange("vintage", value)}
              style={styles.input}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Région</Text>
            <TextInput
              value={form.region}
              placeholder="Bordeaux"
              placeholderTextColor={palette.mutedText}
              onChangeText={(value) => handleFieldChange("region", value)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lieu de dégustation (Adresse)</Text>
          <TextInput
            value={form.location}
            placeholder="Adresse ou lieu..."
            placeholderTextColor={palette.mutedText}
            onChangeText={(value) => handleFieldChange("location", value)}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Note & Appréciation</Text>

        <StarRating
          rating={form.rating}
          onChange={(r) => handleFieldChange("rating", r)}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Commentaire</Text>
          <TextInput
            value={form.notes}
            onChangeText={(value) => handleFieldChange("notes", value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Notes de dégustation..."
            placeholderTextColor={palette.mutedText}
            style={[styles.input, styles.textarea]}
          />
        </View>
      </View>

      <WineButton
        title={saving ? "Enregistrement..." : "Valider la bouteille"}
        onPress={saveBottle}
        disabled={!canSave || saving}
        loading={saving}
        icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 24,
  },
  photo: {
    width: "100%",
    height: 260,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    zIndex: 1, // Important for autocomplete dropdown
  },
  cardLabel: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  field: {
    marginBottom: spacing.md,
    zIndex: 2, // Higher zIndex for autocomplete container
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    zIndex: 1,
  },
  label: {
    color: palette.mutedText,
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: palette.text,
    backgroundColor: palette.surfaceAlt,
    fontSize: 16,
  },
  textarea: {
    minHeight: 100,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    zIndex: 0,
  },
});
