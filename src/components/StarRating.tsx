import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, spacing, typography } from "../styles/theme";

type Props = {
    rating: number;
    onChange: (rating: number) => void;
};

export function StarRating({ rating, onChange }: Props) {
    // 10 stars is a lot to fit in one row, maybe 5 stars with half steps?
    // Or just 10 small stars. Let's try 5 stars where each star is 2 points?
    // User asked for "1 to 10 stars". Let's do 10 stars but maybe smaller or two rows?
    // Or a slider style.
    // Let's try a clean row of 5 stars that act as 1-10 (half stars) or just 10 stars if they fit.
    // On mobile, 10 stars might be tight.
    // Let's implement 5 stars with half-star precision for visual, but underlying is 1-10.
    // Actually user said "slider stylé en forme d’étoiles (1 à 10 étoiles)".
    // Let's do 5 stars, where full = 2 points.
    // So 1 star = 2/10. Half star = 1/10.

    // Wait, "1 à 10 étoiles" implies 10 actual stars.
    // Let's try to fit 10 stars. If too small, we can wrap.

    return (
        <View style={styles.container}>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <TouchableOpacity
                        key={value}
                        onPress={() => onChange(value)}
                        activeOpacity={0.7}
                        style={styles.starContainer}
                    >
                        <Ionicons
                            name={value <= rating ? "star" : "star-outline"}
                            size={28}
                            color={value <= rating ? palette.accent : palette.mutedText}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.ratingText}>{rating}/10</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: spacing.md,
    },
    starsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
    },
    starContainer: {
        padding: 2,
    },
    ratingText: {
        ...typography.body,
        marginTop: spacing.sm,
        fontWeight: "bold",
        color: palette.accent,
        fontSize: 18,
    },
});
