import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapBottle } from '../types/bottle';
import { palette } from '../styles/theme';
import { Region } from 'react-native-maps';
import 'leaflet/dist/leaflet.css';

export interface MapRef {
    animateToRegion: (region: Region, duration?: number) => void;
}

export interface MapProps {
    points: MapBottle[];
    onMarkerPress: (bottle: MapBottle) => void;
    initialRegion: Region;
}

export const WineMap = forwardRef<MapRef, MapProps>(({ points, onMarkerPress, initialRegion }, ref) => {
    const mapRef = useRef<L.Map>(null);

    useImperativeHandle(ref, () => ({
        animateToRegion: (region, duration) => {
            mapRef.current?.flyTo([region.latitude, region.longitude], 13, {
                duration: duration ? duration / 1000 : 1
            });
        },
    }));

    const createCustomIcon = () => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="width: 16px; height: 16px; border-radius: 8px; background-color: ${palette.accent}; border: 2px solid ${palette.primaryDark};"></div>
          <div style="width: 2px; height: 10px; background-color: ${palette.accent}; margin-top: -2px;"></div>
        </div>
      `,
            iconSize: [20, 30],
            iconAnchor: [10, 30],
        });
    };

    return (
        <View style={styles.container}>
            <style>
                {`
          .leaflet-container {
            height: 100%;
            width: 100%;
            background-color: ${palette.surface};
            z-index: 0;
          }
        `}
            </style>

            <MapContainer
                center={[initialRegion.latitude, initialRegion.longitude]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {points.map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.latitude!, point.longitude!]}
                        icon={createCustomIcon()}
                        eventHandlers={{
                            click: () => onMarkerPress(point),
                        }}
                    />
                ))}
            </MapContainer>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 16,
    },
});
