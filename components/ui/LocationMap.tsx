'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Locate, Check, Loader2 } from 'lucide-react';

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface LocationMapProps {
    onLocationSelect: (coordinates: [number, number]) => void;
    initialCoordinates?: [number, number];
    showCurrentLocation?: boolean;
}

export function LocationMap({
    onLocationSelect,
    initialCoordinates = [85.3240, 27.7172], // Default to Kathmandu
    showCurrentLocation = true,
}: LocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [coordinates, setCoordinates] = useState<[number, number]>(initialCoordinates);
    const [locating, setLocating] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: initialCoordinates,
            zoom: 12,
        });

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        // Add marker
        marker.current = new mapboxgl.Marker({
            color: '#ec4899',
            draggable: true,
        })
            .setLngLat(initialCoordinates)
            .addTo(map.current);

        // Handle marker drag
        marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) {
                const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
                setCoordinates(newCoords);
                onLocationSelect(newCoords);
            }
        });

        // Handle map click
        map.current.on('click', (e) => {
            const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            marker.current?.setLngLat(newCoords);
            setCoordinates(newCoords);
            onLocationSelect(newCoords);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [initialCoordinates, onLocationSelect]);

    function locateMe() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords: [number, number] = [
                    position.coords.longitude,
                    position.coords.latitude,
                ];

                map.current?.flyTo({
                    center: newCoords,
                    zoom: 14,
                });

                marker.current?.setLngLat(newCoords);
                setCoordinates(newCoords);
                onLocationSelect(newCoords);
                setLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Could not get your location. Please select manually on the map.');
                setLocating(false);
            },
            { enableHighAccuracy: true }
        );
    }

    function confirmLocation() {
        onLocationSelect(coordinates);
    }

    return (
        <div className="relative w-full rounded-2xl overflow-hidden">
            {/* Map Container */}
            <div
                ref={mapContainer}
                className="w-full h-64 md:h-80"
                style={{ minHeight: '256px' }}
            />

            {/* Controls Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
                {showCurrentLocation && (
                    <button
                        onClick={locateMe}
                        disabled={locating}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg"
                    >
                        {locating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Locating...
                            </>
                        ) : (
                            <>
                                <Locate className="w-4 h-4" />
                                Use my location
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Coordinates Display */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/90 backdrop-blur text-sm">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    <span className="text-zinc-300">
                        {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
            )}
        </div>
    );
}

// Simple location picker for onboarding
interface LocationPickerProps {
    onLocationSelect: (location: { type: string; coordinates: [number, number] }) => void;
    currentLocation?: { type: string; coordinates: [number, number] } | null;
}

export function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
    const [showMap, setShowMap] = useState(false);
    const [locating, setLocating] = useState(false);

    function handleLocationSelect(coordinates: [number, number]) {
        onLocationSelect({
            type: 'Point',
            coordinates,
        });
    }

    function locateMe() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleLocationSelect([
                    position.coords.longitude,
                    position.coords.latitude,
                ]);
                setLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setShowMap(true);
                setLocating(false);
            },
            { enableHighAccuracy: true }
        );
    }

    function useDefaultLocation() {
        // Default to Kathmandu
        handleLocationSelect([85.3240, 27.7172]);
    }

    if (currentLocation) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/30">
                    <Check className="w-6 h-6 text-green-500" />
                    <div className="flex-1">
                        <span className="text-green-400">Location set</span>
                        <p className="text-xs text-zinc-500">
                            {currentLocation.coordinates[1].toFixed(4)}, {currentLocation.coordinates[0].toFixed(4)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowMap(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-400"
                >
                    Change location on map
                </button>

                {showMap && (
                    <LocationMap
                        onLocationSelect={handleLocationSelect}
                        initialCoordinates={currentLocation.coordinates}
                    />
                )}
            </div>
        );
    }

    if (showMap) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-zinc-400 text-center">
                    Tap on the map or drag the pin to set your location
                </p>
                <LocationMap onLocationSelect={handleLocationSelect} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={locateMe}
                disabled={locating}
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
            >
                {locating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Getting location...
                    </>
                ) : (
                    <>
                        <MapPin className="w-5 h-5" />
                        Enable location
                    </>
                )}
            </button>

            <div className="text-center space-y-2">
                <p className="text-xs text-zinc-500">Having trouble?</p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setShowMap(true)}
                        className="text-sm text-pink-400 hover:text-pink-300"
                    >
                        Select on map
                    </button>
                    <span className="text-zinc-600">or</span>
                    <button
                        onClick={useDefaultLocation}
                        className="text-sm text-zinc-400 hover:text-zinc-300"
                    >
                        Use default
                    </button>
                </div>
            </div>
        </div>
    );
}
