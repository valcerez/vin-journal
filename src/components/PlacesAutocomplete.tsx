import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, radii, spacing, typography } from "../styles/theme";

// We use the EXPO_PUBLIC_ prefix to expose the key to the client
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

type Suggestion = {
    place_id: string;
    description: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
};

type PlaceDetails = {
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
};

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    onPlaceSelected: (details: {
        name: string;
        location: string;
        latitude: number;
        longitude: number;
    }) => void;
    placeholder?: string;
};

export function PlacesAutocomplete({
    value,
    onChangeText,
    onPlaceSelected,
    placeholder = "Rechercher un vin, un château...",
}: Props) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Sync internal state if external value changes (e.g. initial load)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    const fetchSuggestions = async (input: string) => {
        if (!input || input.length < 3) {
            setSuggestions([]);
            return;
        }

        if (!GOOGLE_API_KEY) {
            console.warn("Google Places API Key is missing! Check your .env file.");
            return;
        }

        console.log("Fetching suggestions for:", input);
        try {
            setLoading(true);
            // New Places API (v1)
            // https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
            const url = "https://places.googleapis.com/v1/places:autocomplete";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_API_KEY,
                },
                body: JSON.stringify({
                    input: input,
                    languageCode: "fr",
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
            }

            if (data.suggestions) {
                // Map new API format to our internal Suggestion type
                const mappedSuggestions = data.suggestions.map((s: any) => ({
                    place_id: s.placePrediction.placeId,
                    description: s.placePrediction.text.text,
                    structured_formatting: {
                        main_text: s.placePrediction.structuredFormat.mainText.text,
                        secondary_text: s.placePrediction.structuredFormat.secondaryText?.text || "",
                    },
                }));
                setSuggestions(mappedSuggestions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (placeId: string, nameOverride: string) => {
        if (!GOOGLE_API_KEY) return;

        try {
            // New Places API (v1) for details
            const url = `https://places.googleapis.com/v1/places/${placeId}`;

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_API_KEY,
                    "X-Goog-FieldMask": "name,formattedAddress,location",
                },
            });

            const data = await response.json();

            if (data.name) {
                onPlaceSelected({
                    name: nameOverride, // Use the full name from the suggestion
                    location: data.formattedAddress,
                    latitude: data.location.latitude,
                    longitude: data.location.longitude,
                });
                setQuery(nameOverride);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error("Error fetching place details:", error);
        }
    };

    const handleTextChange = (text: string) => {
        setQuery(text);
        onChangeText(text);
        fetchSuggestions(text);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Ionicons name="search" size={20} color={palette.mutedText} style={styles.searchIcon} />
                <TextInput
                    value={query}
                    onChangeText={handleTextChange}
                    placeholder={placeholder}
                    placeholderTextColor={palette.mutedText}
                    style={styles.input}
                    onFocus={() => setShowSuggestions(true)}
                />
                {loading && <ActivityIndicator size="small" color={palette.accent} style={styles.loader} />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsList}>
                    {suggestions.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            style={styles.suggestionItem}
                            onPress={() => {
                                const fullName = item.structured_formatting.main_text;
                                setQuery(fullName);
                                fetchDetails(item.place_id, fullName);
                            }}
                        >
                            <View>
                                <Text style={styles.mainText}>{item.structured_formatting.main_text}</Text>
                                <Text style={styles.secondaryText}>
                                    {item.structured_formatting.secondary_text}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10, // Ensure suggestions float above other content
        marginBottom: spacing.md,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radii.md,
        backgroundColor: palette.surfaceAlt,
        paddingHorizontal: spacing.md,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        color: palette.text,
        fontSize: 16,
    },
    loader: {
        marginLeft: spacing.sm,
    },
    suggestionsList: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        borderBottomLeftRadius: radii.md,
        borderBottomRightRadius: radii.md,
        maxHeight: 200,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    suggestionItem: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
    },
    mainText: {
        color: palette.text,
        fontWeight: "600",
        fontSize: 14,
    },
    secondaryText: {
        color: palette.mutedText,
        fontSize: 12,
        marginTop: 2,
    },
});
