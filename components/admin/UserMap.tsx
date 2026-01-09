'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface User {
    _id: string;
    name: string;
    email: string;
    location?: {
        coordinates: [number, number];
    };
    photos: string[];
}

interface UserMapProps {
    users: User[];
}

export default function UserMap({ users }: UserMapProps) {
    // Filter users with valid coordinates
    const validUsers = users.filter(
        user => user.location?.coordinates &&
            Array.isArray(user.location.coordinates) &&
            user.location.coordinates.length === 2
    );

    // Default center (can be approximate center of all users or a fixed point)
    const center: [number, number] = [20, 0]; // Global view

    return (
        <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-zinc-800 relative z-0">
            <MapContainer
                center={center}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validUsers.map((user) => (
                    <Marker
                        key={user._id}
                        position={[user.location!.coordinates[1], user.location!.coordinates[0]]} // GeoJSON is [lng, lat], Leaflet is [lat, lng]
                        icon={icon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <div className="font-bold mb-1">{user.name}</div>
                                <div className="text-zinc-500 mb-2">{user.email}</div>
                                {user.photos[0] && (
                                    <div className="w-full h-24 relative rounded-lg overflow-hidden">
                                        <img
                                            src={user.photos[0]}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
