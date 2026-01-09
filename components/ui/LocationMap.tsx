'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Locate, Check, Loader2, X } from 'lucide-react';

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
    gpsOnly = false,
}: LocationMapProps & { gpsOnly?: boolean }) {
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
            draggable: !gpsOnly,
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
        if (!gpsOnly) {
            map.current.on('click', (e) => {
                const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                marker.current?.setLngLat(newCoords);
                setCoordinates(newCoords);
                onLocationSelect(newCoords);
            });
        }

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [initialCoordinates, onLocationSelect, gpsOnly]);

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

interface LocationPickerProps {
    onLocationSelect: (location: { type: string; coordinates: [number, number] } | null, address?: string) => void;
    currentLocation?: { type: string; coordinates: [number, number] } | null;
    currentAddress?: string;
    gpsOnly?: boolean;
}

export function LocationPicker({ onLocationSelect, currentLocation, currentAddress, gpsOnly = false }: LocationPickerProps) {
    const [showMap, setShowMap] = useState(false);
    const [locating, setLocating] = useState(false);
    // Initialize with prop if available
    const [address, setAddress] = useState<string>(currentAddress || '');

    useEffect(() => {
        async function fetchAddress() {
            if (!currentLocation) {
                setAddress('');
                return;
            }

            // Only fetch if we don't have an address yet or coordinates change
            const [lng, lat] = currentLocation.coordinates;
            try {
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.features && data.features.length > 0) {
                        const newAddress = data.features[0].place_name;
                        setAddress(newAddress);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch address:', error);
            }
        }

        fetchAddress();
    }, [currentLocation]);

    async function handleLocationSelect(coordinates: [number, number]) {
        // Fetch address immediately for the selection
        let selectedAddress = '';
        try {
            const [lng, lat] = coordinates;
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            if (res.ok) {
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    selectedAddress = data.features[0].place_name;
                    setAddress(selectedAddress);
                }
            }
        } catch (e) {
            console.error(e);
        }

        onLocationSelect({
            type: 'Point',
            coordinates,
        }, selectedAddress);
        setShowMap(false);
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
                setShowMap(true); // Fallback to map
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
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-green-600 font-medium block">Location set</span>
                        <p className="text-sm text-zinc-600 truncate">
                            {address || `${currentLocation.coordinates[1].toFixed(4)}, ${currentLocation.coordinates[0].toFixed(4)}`}
                        </p>
                    </div>
                    <button
                        onClick={() => onLocationSelect(null)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Remove location"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!gpsOnly && (
                    <button
                        onClick={() => setShowMap(true)}
                        className="text-sm text-zinc-500 hover:text-zinc-600 underline decoration-zinc-300 underline-offset-4"
                    >
                        Change location on map
                    </button>
                )}

                {showMap && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200">
                        <LocationMap
                            onLocationSelect={handleLocationSelect}
                            initialCoordinates={currentLocation.coordinates}
                        />
                        <div className="bg-zinc-50 p-2 text-center">
                            <button
                                onClick={() => setShowMap(false)}
                                className="text-xs text-zinc-500 hover:text-zinc-700"
                            >
                                Close Map
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (showMap) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                        {gpsOnly ? 'Your current location' : 'Tap on the map or drag the pin to set your location'}
                    </p>
                    <button
                        onClick={() => setShowMap(false)}
                        className="text-sm text-zinc-500 hover:text-zinc-800"
                    >
                        Cancel
                    </button>
                </div>
                <LocationMap onLocationSelect={handleLocationSelect} gpsOnly={gpsOnly} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={locateMe}
                disabled={locating}
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-[0.98]"
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
                    {!gpsOnly && (
                        <>
                            <button
                                onClick={() => setShowMap(true)}
                                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
                            >
                                Select on map
                            </button>
                            <span className="text-zinc-300">|</span>
                        </>
                    )}
                    <button
                        onClick={useDefaultLocation}
                        className="text-sm text-zinc-400 hover:text-zinc-600"
                    >
                        Use default
                    </button>
                </div>
            </div>
        </div>
    );
}
