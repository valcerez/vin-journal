import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, radii, spacing, typography } from "../styles/theme";

type BottleCardProps = {
    item: {
        id: string;
        image_url: string | null;
        name: string | null;
        vintage: string | null;
        rating: number | null;
        notes: string | null;
        region: string | null;
        location: string | null;
    };
};

export function BottleCard({ item }: BottleCardProps) {
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

                {item.notes ? (
                    <Text style={styles.notes} numberOfLines={2}>
                        {item.notes}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
