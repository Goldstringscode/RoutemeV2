import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, MapPin, Loader, AlertTriangle, ShieldOff } from "lucide-react";
import { captureGps, getGpsAccuracyLabel, checkGpsPermission, distanceFromClient, startContinuousGps } from "@/lib/evvService";
import { saveGpsReadings } from "@/lib/dataService";
import GpsMapPreview from "./GpsMapPreview";

export default function EvvClockInOut({
  clientId,
  clientName,
  clientLat,
  clientLng,
  evvStatus,         // null | "clocked_in" | "clocked_out"
  onClockIn,
  onClockOut,
  disabled,
}) {
  const [gpsStatus, setGpsStatus] = useState(null); // null | "capturing" | "preview" | "success" | "failed" | "denied"
  const [gpsData, setGpsData] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsFallbackMode, setGpsFallbackMode] = useState(null);
  const [distFromClient, setDistFromClient] = useState(null);
  const [gpsPermission, setGpsPermission] = useState(null); // null | "granted" | "denied" | "prompt"
  const [continuousTracker, setContinuousTracker] = useState(null); // { stop, readings } from startContinuousGps

  // Check permission on mount
  useEffect(() => {
    checkGpsPermission().then(setGpsPermission);
  }, []);

  const startCapture = async () => {
    // Check permission first
    const perm = gpsPermission || await checkGpsPermission();
    if (perm === "denied") {
      setGpsStatus("denied");
      return null;
    }

    setGpsStatus("capturing");
    return await captureGps();
  };

  const handleClockIn = async () => {
    if (disabled || evvStatus === "clocked_in") return;

    const gps = await startCapture();
    if (!gps) {
      // GPS denied or failed — trigger override
      setGpsStatus(gpsPermission === "denied" ? "denied" : "failed");
      onClockIn(clientId, null);
      return;
    }

    // Store GPS data and show preview
    setGpsData(gps);
    setGpsAccuracy(gps.accuracy);
    setGpsFallbackMode(gps.gpsFallbackMode || "gps");

    // Compute distance from client address
    let distanceMeters = null;
    if (clientLat && clientLng && gps.lat && gps.lng) {
      distanceMeters = distanceFromClient(clientLat, clientLng, gps.lat, gps.lng);
      setDistFromClient(distanceMeters);
    }

    setGpsStatus("preview");
  };

  const handleConfirmPreview = () => {
    setGpsStatus("success");
    onClockIn(clientId, {
      lat: gpsData.lat,
      lng: gpsData.lng,
      accuracy: gpsData.accuracy,
      altitude: gpsData.altitude,
      heading: gpsData.heading,
      speed: gpsData.speed,
      capturedAt: gpsData.capturedAt,
      gpsFallbackMode: gpsData.gpsFallbackMode,
      distanceFromClient: distFromClient,
    });
    // Start continuous GPS tracking during visit
    const tracker = startContinuousGps({ intervalMs: 300000 });
    setContinuousTracker(tracker);
  };

  const handleRetryGps = async () => {
    const gps = await startCapture();
    if (!gps) {
      setGpsStatus("failed");
      onClockIn(clientId, null);
      return;
    }
    setGpsData(gps);
    setGpsAccuracy(gps.accuracy);
    setGpsFallbackMode(gps.gpsFallbackMode || "gps");

    let distanceMeters = null;
    if (clientLat && clientLng && gps.lat && gps.lng) {
      distanceMeters = distanceFromClient(clientLat, clientLng, gps.lat, gps.lng);
      setDistFromClient(distanceMeters);
    }

    setGpsStatus("preview");
  };

  const handleCancelPreview = () => {
    setGpsStatus("failed");
    onClockIn(clientId, null);
  };

  const handleClockOut = async () => {
    if (disabled || evvStatus !== "clocked_in") return;

    // Stop continuous GPS tracking and save readings
    if (continuousTracker) {
      continuousTracker.stop();
      if (continuousTracker.readings.length > 0) {
        saveGpsReadings(null, continuousTracker.readings).catch(() => {}); // best-effort
      }
      setContinuousTracker(null);
    }

    setGpsStatus("capturing");
    const gps = await captureGps();
    if (gps) {
      setGpsAccuracy(gps.accuracy);
      setGpsFallbackMode(gps.gpsFallbackMode || "gps");
      onClockOut(clientId, {
        lat: gps.lat,
        lng: gps.lng,
        accuracy: gps.accuracy,
        altitude: gps.altitude,
        heading: gps.heading,
        speed: gps.speed,
        capturedAt: gps.capturedAt,
        gpsFallbackMode: gps.gpsFallbackMode,
      });
    } else {
      onClockOut(clientId, null);
    }
    setGpsStatus(null);
  };

  if (evvStatus === "clocked_out") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs text-stone-500">
        <CheckCircle className="h-3.5 w-3.5 text-stone-400" />
        Visit complete
      </div>
    );
  }

  // Show map preview step after GPS capture, before final clock-in
  if (gpsStatus === "preview" && gpsData) {
    return (
      <GpsMapPreview
        gpsData={gpsData}
        clientLat={clientLat}
        clientLng={clientLng}
        clientName={clientName}
        onConfirm={handleConfirmPreview}
        onRetry={handleRetryGps}
        onCancel={handleCancelPreview}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Clock In */}
      {evvStatus !== "clocked_in" && (
        <button
          onClick={handleClockIn}
          disabled={disabled || gpsStatus === "capturing"}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            gpsStatus === "success"
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : gpsStatus === "failed"
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : gpsStatus === "denied"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          } disabled:opacity-60 disabled:cursor-wait`}
          title="Clock in — captures GPS location"
        >
          {gpsStatus === "capturing" ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : gpsStatus === "denied" ? (
            <ShieldOff className="h-3.5 w-3.5" />
          ) : (
            <Clock className="h-3.5 w-3.5" />
          )}
          {gpsStatus === "capturing" ? "GPS..." : gpsStatus === "denied" ? "GPS Blocked" : "Clock In"}
        </button>
      )}

      {/* Clock Out (only after clock-in) */}
      {evvStatus === "clocked_in" && (
        <button
          onClick={handleClockOut}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          title="Clock out — captures GPS location and ends visit"
        >
          <XCircle className="h-3.5 w-3.5" />
          Clock Out
        </button>
      )}

      {/* GPS accuracy + fallback mode indicator */}
      {gpsAccuracy !== null && (
        <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
          <MapPin className="h-3 w-3" />
          {getGpsAccuracyLabel(gpsAccuracy)} ({Math.round(gpsAccuracy)}m)
          {gpsFallbackMode === "wifi" && (
            <span className="text-amber-500 ml-0.5">(WiFi loc)</span>
          )}
        </span>
      )}

      {/* Distance-from-client warning */}
      {distFromClient !== null && distFromClient > 100 && (
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          {Math.round(distFromClient)}m from address
        </span>
      )}
    </div>
  );
}