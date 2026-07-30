import React, { useState } from "react";
import { MapPin, LocateFixed, Navigation } from "lucide-react";
import { distanceFromClient, getGpsAccuracyLabel } from "@/lib/evvService";

/**
 * GpsMapPreview — Shows a small Mapbox static map with GPS pin and
 * client-address pin, plus distance between them.
 *
 * This is the "confirm your location" step before clock-in, matching
 * the industry-standard Sandata/HHAeXchange UX pattern.
 */
export default function GpsMapPreview({
  gpsData,       // { lat, lng, accuracy, gpsFallbackMode, ... }
  clientLat,
  clientLng,
  clientName,
  onConfirm,     // () => proceed with clock-in
  onRetry,       // () => re-capture GPS
  onCancel,      // () => go back / trigger override
}) {
  const [imgError, setImgError] = useState(false);
  const distance = distanceFromClient(clientLat, clientLng, gpsData.lat, gpsData.lng);
  const isFar = distance !== null && distance > 100;
  const accuracyLabel = getGpsAccuracyLabel(gpsData.accuracy);

  // Build Mapbox static map URL if we have client coordinates
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN || "";
  const hasMapbox = mapboxToken.length > 0 && clientLat && clientLng;
  const mapImageUrl = hasMapbox
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+f44(+${gpsData.lat},${gpsData.lng})/pin-l+3a3(${clientLat},${clientLng})/${clientLng},${clientLat},14,0/300x160@2x?access_token=${mapboxToken}`
    : null;

  const showMap = hasMapbox && !imgError;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-stone-800">Confirm Location</h4>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          isFar ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
        }`}>
          {isFar ? `${Math.round(distance)}m away` : "Correct location"}
        </span>
      </div>

      {/* Map preview */}
      {showMap ? (
        <div className="rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
          <img
            src={mapImageUrl}
            alt={`Map showing GPS pin near ${clientName || "client"} location`}
            className="w-full h-40 object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 text-sm">
          <div className="text-center">
            <LocateFixed className="h-8 w-8 mx-auto mb-2" />
            <p>GPS coordinates captured</p>
            <p className="text-xs mt-1">{gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}</p>
          </div>
        </div>
      )}

      {/* Details row */}
      <div className="flex items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Accuracy: {accuracyLabel} ({Math.round(gpsData.accuracy)}m)
        </span>
        {gpsData.gpsFallbackMode === "wifi" && (
          <span className="text-amber-600">WiFi location</span>
        )}
        {distance !== null && (
          <span className="flex items-center gap-1">
            <Navigation className="h-3 w-3" /> {Math.round(distance)}m from {clientName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Confirm & Clock In
        </button>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Retry GPS
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white text-stone-500 text-sm font-medium rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}