import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapBottle } from '../types/bottle';
import { palette } from '../styles/theme';
import { mapStyle } from '../styles/mapStyle';

export interface MapRef {
    animateToRegion: (region: Region, duration?: number) => void;
}

export interface MapProps {
    points: MapBottle[];
    onMarkerPress: (bottle: MapBottle) => void;
    initialRegion: Region;
}

export const WineMap = forwardRef<MapRef, MapProps>(({ points, onMarkerPress, initialRegion }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
        animateToRegion: (region, duration) => {
            mapRef.current?.animateToRegion(region, duration);
        },
    }));

    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            customMapStyle={mapStyle}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsCompass={false}
            showsPointsOfInterest={false}
        >
            {points.map((point) => (
                <Marker
                    key={point.id}
                    coordinate={{ latitude: point.latitude!, longitude: point.longitude! }}
                    onPress={() => onMarkerPress(point)}
                >
                    <View style={styles.markerContainer}>
                        <View style={styles.markerDot} />
                        <View style={styles.markerStem} />
                    </View>
                </Marker>
            ))}
        </MapView>
    );
});

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: palette.accent,
        borderWidth: 2,
        borderColor: palette.primaryDark,
    },
    markerStem: {
        width: 2,
        height: 10,
        backgroundColor: palette.accent,
        marginTop: -2,
    },
});
