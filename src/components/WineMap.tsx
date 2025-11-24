import { Region } from "react-native-maps";
import { MapBottle } from "../types/bottle";

export interface MapRef {
    animateToRegion: (region: Region, duration?: number) => void;
}

export interface MapProps {
    points: MapBottle[];
    onMarkerPress: (bottle: MapBottle) => void;
    initialRegion: Region;
}

import { forwardRef } from "react";

// This default implementation is overridden by WineMap.native.tsx and WineMap.web.tsx
export const WineMap = forwardRef<MapRef, MapProps>((props, ref) => null);
