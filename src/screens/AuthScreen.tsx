import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { WineButton } from "../components/WineButton";
import { palette, radii, spacing, typography } from "../styles/theme";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession(); // Required for web

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signUp = async () => {
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Compte créé 🎉");
  };

  const signIn = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Connexion réussie ✅");
  };

  const signInWithOAuth = async (provider: "google") => {
    setMessage("");
    try {
      const redirectUrl = Linking.createURL("/");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false, // Let Supabase handle the redirect on web
        },
      });

      if (error) throw error;

      // On native, we might need to handle the deep link manually if we used skipBrowserRedirect: true
      // But for web PWA, we want the browser to redirect.
      // If we are in a native app (not web), we might need the WebBrowser flow.
      if (Platform.OS !== 'web' && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === "success" && result.url) {
          // The session is handled by the onAuthStateChange listener in App.tsx
          // But we might need to parse the URL if Supabase doesn't auto-detect it from the deep link
          // Usually, supabase.auth.getSession() or the listener picks it up.
        }
      }
    } catch (err: any) {
      setMessage(`Erreur: ${err.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.hero}>
            <Ionicons name="wine-outline" size={34} color={palette.accent} />
            <Text style={styles.heroTitle}>Appli Vin</Text>
            <Text style={styles.heroSubtitle}>Ton carnet de dégustation digital.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connexion / Inscription</Text>
            <TextInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={palette.mutedText}
              style={styles.input}
            />
            <TextInput
              placeholder="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={palette.mutedText}
              style={styles.input}
            />

            <WineButton
              title="Créer un compte"
              onPress={signUp}
              icon={<Ionicons name="sparkles-outline" size={18} color="#fff" />}
              style={styles.btnSpacing}
            />
            <WineButton
              title="Se connecter"
              variant="secondary"
              onPress={signIn}
              icon={<Ionicons name="log-in-outline" size={18} color="#fff" />}
            />

            {message ? <Text style={styles.message}>{message}</Text> : null}



            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <WineButton
              title="Continuer avec Google"
              variant="secondary"
              onPress={() => signInWithOAuth("google")}
              icon={<Ionicons name="logo-google" size={18} color={palette.text} />}
              style={styles.socialBtn}
            />

          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  inner: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.text,
    backgroundColor: palette.surfaceAlt,
    marginBottom: spacing.sm,
  },
  btnSpacing: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  message: {
    marginTop: spacing.md,
    textAlign: "center",
    color: palette.accent,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    color: palette.mutedText,
    paddingHorizontal: spacing.sm,
    fontSize: 12,
  },
  socialBtn: {
    marginBottom: spacing.sm,
  },
  debugText: {
    fontSize: 10,
    color: palette.mutedText,
    textAlign: "center",
    marginTop: spacing.sm,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
