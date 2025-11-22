import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { Session } from "@supabase/supabase-js";
import { Ionicons } from "@expo/vector-icons";
import AuthScreen from "./src/screens/AuthScreen";
import AddBottleScreen from "./src/screens/AddBottleScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import MapScreen from "./src/screens/MapScreen";
import { supabase } from "./src/lib/supabase";
import { useOfflineQueue } from "./src/hooks/useOfflineQueue";
import { palette } from "./src/styles/theme";

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useOfflineQueue(Boolean(session));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: "transparent",
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { letterSpacing: 0.5 },
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: "rgba(255,255,255,0.05)",
          },
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.mutedText,
          tabBarLabelStyle: { fontWeight: "600" },
          sceneContainerStyle: { backgroundColor: palette.background },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "wine-outline";
            if (route.name === "Ajouter") iconName = "camera-outline";
            if (route.name === "Historique") iconName = "book-outline";
            if (route.name === "Carte") iconName = "map-outline";
            return <Ionicons name={iconName} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Ajouter" component={AddBottleScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
        <Tab.Screen name="Carte" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
