import { useState } from "react";
import { View, Text, Image, Alert, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import BottleFormScreen from "./BottleFormScreen";
import { palette, radii, spacing, typography } from "../styles/theme";
import { WineButton } from "../components/WineButton";
import { AddBottleStackParamList } from "../navigation/types";

type CaptureNav = NativeStackNavigationProp<AddBottleStackParamList, "Capture">;
const Stack = createNativeStackNavigator<AddBottleStackParamList>();

export default function AddBottleScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="Capture" component={CaptureScreen} />
      <Stack.Screen
        name="BottleForm"
        component={BottleFormScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function CaptureScreen() {
  const navigation = useNavigation<CaptureNav>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission refusée", "Autorise la caméra pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85, base64: false });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);

    // Directly go to form with the local URI
    // We will upload in the background or on save in the next screen
    // Actually, to keep it simple and robust, let's upload here or pass URI to next screen
    // The original flow uploaded first. Let's pass URI and upload in next screen or here.
    // Better UX: Show preview here, then user clicks "Valider" -> Upload & Go.
    // Or even faster: Photo taken -> Immediate transition to Form with local URI. Upload happens when saving form.
    // User wants "Photo -> Page formulaire".

    navigation.navigate("BottleForm", {
      imageUri: uri,
      // Will be handled in form or we upload now?
      // Let's upload now to get a public URL if we need it for the DB immediately, 
      // BUT for speed, we should probably just pass the URI and let the form handle saving.
      // However, the previous logic passed publicImageUrl.
      // Let's change the contract: Pass local URI, and the Form screen handles the upload if needed, 
      // OR we upload here quickly.
      // Let's upload here to keep the Form screen focused on data entry.
      // Wait, "Photo -> Page formulaire". If we upload here, we block the user.
      // Let's navigate immediately and pass the local URI. The Form screen can trigger upload in background or on save.
      // I need to check BottleFormScreen expectations. It expects publicImageUrl.
      // I will update BottleFormScreen to handle upload or I'll upload here with a loader.
      // Let's upload here for simplicity of the transition for now, or update Form.
      // User said "pure photo, aucun traitement automatique".

      // Let's try to upload here quickly.
      initialForm: {
        name: "",
        vintage: "",
        region: "",
        location: "",
        latitude: null,
        longitude: null,
        rating: 0,
        notes: "",
      },
    });
  };

  // We can also just pick from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled) return;
    const uri = result.assets[0].uri;

    navigation.navigate("BottleForm", {
      imageUri: uri,
      initialForm: {
        name: "",
        vintage: "",
        region: "",
        location: "",
        latitude: null,
        longitude: null,
        rating: 0,
        notes: "",
      },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.title}>Nouvelle bouteille</Text>
        <Text style={styles.subtitle}>
          Prends une photo pour commencer.
        </Text>
      </View>

      <View style={styles.placeholder}>
        <View style={styles.placeholderIcon}>
          <Ionicons name="camera-outline" size={48} color={palette.accent} />
        </View>
        <Text style={styles.placeholderTitle}>Ajouter un vin</Text>
      </View>

      <View style={styles.buttons}>
        <WineButton
          title="Prendre une photo"
          onPress={takePhoto}
          icon={<Ionicons name="camera" size={20} color="#fff" />}
          style={styles.button}
        />
        <WineButton
          title="Choisir dans la galerie"
          onPress={pickImage}
          variant="secondary"
          icon={<Ionicons name="images-outline" size={20} color={palette.primary} />}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  hero: {
    marginTop: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 32,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
  },
  placeholderTitle: {
    color: palette.mutedText,
    fontSize: 18,
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    width: "100%",
  },
});
