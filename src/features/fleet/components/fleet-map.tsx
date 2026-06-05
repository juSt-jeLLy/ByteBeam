import { divIcon } from "leaflet";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { Trip, Vehicle } from "@/features/fleet/types";
import { VehicleStatusBadge } from "./status-badge";

interface FleetMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  selectedTrip?: Trip;
  onVehicleSelect?: (vehicleId: string) => void;
  heightClassName?: string;
}

const STATUS_COLORS: Record<Vehicle["status"], string> = {
  active: "#16a34a",
  idle: "#ca8a04",
  attention: "#dc2626",
  offline: "#64748b",
};

function markerIcon(vehicle: Vehicle, selected: boolean) {
  const color = STATUS_COLORS[vehicle.status];
  return divIcon({
    className: "",
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:${selected ? 28 : 22}px;height:${selected ? 28 : 22}px;
      border-radius:999px;background:${color};border:3px solid white;
      box-shadow:0 8px 22px rgba(15,23,42,.25);
    "></span>`,
    iconSize: [selected ? 28 : 22, selected ? 28 : 22],
    iconAnchor: [selected ? 14 : 11, selected ? 14 : 11],
  });
}

function playbackIcon() {
  return divIcon({
    className: "",
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:18px;height:18px;border-radius:999px;background:#0f766e;
      border:3px solid white;box-shadow:0 8px 22px rgba(15,23,42,.25);
    "></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function FleetMap({
  vehicles,
  selectedVehicleId,
  selectedTrip,
  onVehicleSelect,
  heightClassName = "h-[460px]",
}: FleetMapProps) {
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const center = selectedTrip?.route[0] ??
    vehicles[0]?.currentLocation ?? { lat: 12.9716, lng: 77.5946 };
  const routePositions =
    selectedTrip?.route.map((point) => [point.lat, point.lng] as [number, number]) ?? [];
  const playbackPoint = selectedTrip?.route[playbackIndex];
  const playbackMarkerIcon = useMemo(() => playbackIcon(), []);

  useEffect(() => {
    setPlaybackIndex(0);
    setIsPlaying(false);
  }, [selectedTrip?.id]);

  useEffect(() => {
    if (!isPlaying || !selectedTrip || selectedTrip.route.length < 2) return;

    const intervalId = window.setInterval(() => {
      setPlaybackIndex((current) => {
        const next = current + 1;
        if (next >= selectedTrip.route.length) {
          setIsPlaying(false);
          return current;
        }
        return next;
      });
    }, 900);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, selectedTrip]);

  return (
    <div
      className={`relative isolate z-0 overflow-hidden rounded-lg border border-border ${heightClassName}`}
    >
      {selectedTrip && selectedTrip.route.length > 0 && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-md border border-border bg-card/95 p-2 shadow-card backdrop-blur">
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
            aria-label={isPlaying ? "Pause route playback" : "Play route playback"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setPlaybackIndex(0);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
            aria-label="Reset route playback"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="min-w-24 text-xs text-muted-foreground">
            {playbackIndex + 1}/{selectedTrip.route.length} · {playbackPoint?.speedKph ?? 0} km/h
          </span>
        </div>
      )}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom
        className="z-0 h-full w-full"
      >
        <MapViewport center={center} routePositions={routePositions} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePositions.length > 0 && (
          <Polyline positions={routePositions} pathOptions={{ color: "#0f766e", weight: 5 }} />
        )}
        {playbackPoint && (
          <Marker
            position={[playbackPoint.lat, playbackPoint.lng]}
            icon={playbackMarkerIcon}
            zIndexOffset={1000}
          />
        )}
        {vehicles.map((vehicle) => {
          const selected = vehicle.id === selectedVehicleId;
          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.currentLocation.lat, vehicle.currentLocation.lng]}
              icon={markerIcon(vehicle, selected)}
              eventHandlers={{ click: () => onVehicleSelect?.(vehicle.id) }}
            >
              <Popup>
                <div className="min-w-48 space-y-2">
                  <div>
                    <p className="font-semibold">{vehicle.registration}</p>
                    <p className="text-xs text-slate-500">{vehicle.locationName}</p>
                  </div>
                  <VehicleStatusBadge status={vehicle.status} />
                  <p className="text-xs text-slate-600">
                    {vehicle.driver} · {vehicle.energyLevel}% {vehicle.energyType}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function MapViewport({
  center,
  routePositions,
}: {
  center: { lat: number; lng: number };
  routePositions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (routePositions.length > 1) {
      map.fitBounds(routePositions, { padding: [36, 36], maxZoom: 14 });
      return;
    }

    map.setView([center.lat, center.lng], 13);
  }, [center.lat, center.lng, map, routePositions]);

  return null;
}
