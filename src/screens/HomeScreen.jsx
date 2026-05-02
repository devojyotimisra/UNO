import { useState, useMemo } from "react";
import { useGame } from "../context/GameContext";
import socket from "../socket";
import Loader from "../components/Loader";
import "./HomeScreen.css";

const CARD_COLORS = [
  "var(--card-red)",
  "var(--card-green)",
  "var(--card-blue)",
  "var(--card-yellow)",
];
const PROFILE_KEY = "uno_profile";

function getSavedName() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY))?.name || "";
  } catch {
    return "";
  }
}

function saveName(name) {
  const trimmed = name.trim().slice(0, 20);
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: trimmed }));
  return trimmed;
}

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(getSavedName);
  const [roomCode, setRoomCode] = useState("");

  const isConnected = state.connected;
  const isLoading = state.loading === "creating" || state.loading === "joining";
  const canCreate = name.trim().length >= 1 && isConnected && !isLoading;
  const canJoin =
    name.trim().length >= 1 &&
    roomCode.trim().length >= 4 &&
    isConnected &&
    !isLoading;

  const floatingCards = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 12 + Math.random() * 18,
        color: CARD_COLORS[i % 4],
        rotation: Math.random() * 40 - 20,
        size: 50 + Math.random() * 30,
      })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
        size: 2 + Math.random() * 4,
      })),
    [],
  );

  const handleCreate = () => {
    const saved = saveName(name);
    if (!saved) return;
    dispatch({ type: "SET_LOADING", payload: "creating" });
    socket.emit("create_room", { name: saved });
  };

  const handleJoin = () => {
    const saved = saveName(name);
    const code = roomCode.trim().toUpperCase();
    if (!saved || !code) return;
    dispatch({ type: "SET_LOADING", payload: "joining" });
    socket.emit("join_room", { name: saved, roomCode: code });
  };

  const handleRoomCodeChange = (e) => {
    setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

  return (
    <section className="home-screen">
      <div className="home-bg" aria-hidden="true">
        {floatingCards.map((c) => (
          <div
            key={c.id}
            className="floating-card"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.5}px`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transform: `rotate(${c.rotation}deg)`,
            }}
          />
        ))}
        {particles.map((p) => (
          <div
            key={`p-${p.id}`}
            className="ambient-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`connection-dot ${isConnected ? "connected" : "disconnected"}`}
        title={isConnected ? "Connected" : "Reconnecting…"}
      />

      <div className="home-logo-area">
        <h1 className="home-logo">UNO</h1>
        <p className="home-tagline">Play with friends · No account needed</p>
      </div>

      <div className="home-card">
        <div className="input-group">
          <label htmlFor="home-name">Your name</label>
          <input
            id="home-name"
            className="input"
            type="text"
            placeholder="Enter your name"
            maxLength={20}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCreate)}
          />
        </div>

        <button
          id="btn-create-room"
          className="btn btn-primary btn-full"
          disabled={!canCreate}
          onClick={handleCreate}
        >
          {state.loading === "creating" ? (
            <Loader size="small" text="Creating…" />
          ) : (
            "🎮 Create Room"
          )}
        </button>

        <div className="home-divider">
          <span>or join a friend</span>
        </div>

        <div className="input-group">
          <label htmlFor="home-join-code">Room code</label>
          <input
            id="home-join-code"
            className="input room-code-input"
            type="text"
            placeholder="ABC123"
            maxLength={6}
            autoComplete="off"
            autoCorrect="off"
            value={roomCode}
            onChange={handleRoomCodeChange}
            onKeyDown={(e) => handleKeyDown(e, handleJoin)}
          />
        </div>
        <button
          id="btn-join-room"
          className="btn btn-secondary btn-full"
          disabled={!canJoin}
          onClick={handleJoin}
        >
          {state.loading === "joining" ? (
            <Loader size="small" text="Joining…" />
          ) : (
            "🔗 Join Room"
          )}
        </button>
      </div>

      <div className="home-footer">Made with ❤️ • UNO Online</div>
    </section>
  );
}
