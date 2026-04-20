import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:3001";

export default function HardwareSimulator() {
  const socket = useMemo(() => io(API_BASE), []);
  const [state, setState] = useState("idle");
  const [door, setDoor] = useState("locked");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const addEvent = (message) => {
      setEvents((prev) => [
        { id: Date.now() + Math.random(), message, time: new Date().toLocaleTimeString() },
        ...prev,
      ].slice(0, 8));
    };

    const onRequestUpdated = (request) => {
      if (request.status === "approved") {
        setState("granted");
        setDoor("unlocked");
        addEvent(`Access granted for ${request.deviceId}`);

        setTimeout(() => {
          setState("idle");
          setDoor("locked");
          addEvent(`Door relocked for ${request.deviceId}`);
        }, 5000);
      }

      if (request.status === "denied") {
        setState("denied");
        addEvent(`Access denied for ${request.deviceId}`);
        setTimeout(() => setState("idle"), 2000);
      }
    };

    const onUnlockDevice = (deviceId) => {
      setState("granted");
      setDoor("unlocked");
      addEvent(`Unlock command received for ${deviceId}`);
    };

    socket.on("request_updated", onRequestUpdated);
    socket.on("unlock_device", onUnlockDevice);

    return () => {
      socket.off("request_updated", onRequestUpdated);
      socket.off("unlock_device", onUnlockDevice);
      socket.disconnect();
    };
  }, [socket]);

  const lampStyle = (color, active) => ({
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: active ? color : "#d1d5db",
    boxShadow: active ? `0 0 18px ${color}` : "none",
    border: "1px solid #9ca3af",
  });

  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 12, padding: 16, marginTop: 20 }}>
      <h2 style={{ marginTop: 0 }}>AccessHub Edge Simulator</h2>
      <p style={{ marginTop: 0 }}>This simulates the ESP32 hardware state in the browser.</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={lampStyle("#eab308", state === "idle")}></div>
        <span>Idle / Online</span>
        <div style={lampStyle("#22c55e", state === "granted")}></div>
        <span>Granted</span>
        <div style={lampStyle("#ef4444", state === "denied")}></div>
        <span>Denied</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Door state:</strong> {door}
      </div>

      <div
        style={{
          width: 220,
          height: 120,
          border: "2px solid #374151",
          borderRadius: 12,
          position: "relative",
          marginBottom: 16,
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: door === "unlocked" ? 150 : 105,
            width: 70,
            height: 12,
            background: "#6b7280",
            borderRadius: 8,
            transition: "left 0.3s ease",
          }}
        />
        <div style={{ position: "absolute", bottom: 12, left: 16, fontSize: 14 }}>Servo latch mockup</div>
      </div>

      <h3>Recent hardware events</h3>
      <ul>
        {events.length === 0 ? <li>No events yet.</li> : events.map((event) => (
          <li key={event.id}>{event.time} — {event.message}</li>
        ))}
      </ul>
    </div>
  );
}
