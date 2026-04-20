import { useEffect, useState } from "react";
import io from "socket.io-client";
import HardwareSimulator from "./HardwareSimulator.jsx";

const socket = io("http://localhost:3001");

export default function App() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/requests")
      .then((res) => res.json())
      .then(setRequests);

    socket.on("request_created", (req) => {
      setRequests((prev) => [...prev, req]);
    });

    socket.on("request_updated", (updated) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    });

    return () => {
      socket.off("request_created");
      socket.off("request_updated");
    };
  }, []);

  const requestAccess = async () => {
    await fetch("http://localhost:3001/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: "guest", deviceId: "door1" }),
    });
  };

  const approve = async (id) => {
    await fetch(`http://localhost:3001/api/approve/${id}`, {
      method: "POST",
    });
  };

  const deny = async (id) => {
    await fetch(`http://localhost:3001/api/deny/${id}`, {
      method: "POST",
    });
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>AccessHub Demo</h1>

      <button onClick={requestAccess}>Request Access</button>

      <h2 style={{ marginTop: 24 }}>Requests</h2>
      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <div>
            <strong>{r.user}</strong> → {r.deviceId} [{r.status}]
          </div>

          {r.status === "pending" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => approve(r.id)} style={{ marginRight: 8 }}>
                Approve
              </button>
              <button onClick={() => deny(r.id)}>Deny</button>
            </div>
          )}
        </div>
      ))}

      <HardwareSimulator />
    </div>
  );
}
