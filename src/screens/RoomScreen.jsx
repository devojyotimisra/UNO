import { useGame } from "../context/GameContext";
import { avatarColor, avatarInitial } from "../utils/avatars";
import socket from "../socket";
import Loader from "../components/Loader";
import "./RoomScreen.css";

export default function RoomScreen() {
  const { state, dispatch, addToast } = useGame();
  const { room, myId, loading } = state;

  if (!room) return <Loader fullscreen text="Loading room…" />;

  const isHost = room.hostId === myId;
  const canStart = isHost && room.players.length >= 2;
  const startCards = room.settings?.startCards || 7;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard?.writeText(room.roomCode);
      addToast(`Code ${room.roomCode} copied!`, "success", 2000);
    } catch {
      addToast(`Room code: ${room.roomCode}`, "info", 3000);
    }
  };

  const handleUpdateSettings = (val) => {
    if (!isHost) return;
    socket.emit("update_settings", { startCards: val });
  };

  const handleStart = () => {
    dispatch({ type: "SET_LOADING", payload: "starting" });
    socket.emit("start_game");
  };

  const handleLeave = () => {
    socket.emit("leave_room");
    dispatch({ type: "RESET_TO_HOME" });
  };

  return (
    <section className="room-screen">
      <div className="room-header">
        <button className="btn btn-ghost btn-sm" onClick={handleLeave}>
          ← Back
        </button>
        <span className="room-header-title">Waiting Room</span>
        <div
          className="room-code-badge"
          onClick={handleCopyCode}
          title="Click to copy"
          role="button"
        >
          <span className="room-code-val">{room.roomCode}</span>
          <span className="copy-icon">📋</span>
        </div>
      </div>

      <div className="room-body">
        <div className="room-share-box">
          <div className="share-label">Room Code</div>
          <div className="share-code">{room.roomCode}</div>
          <div className="share-hint">Share this code with friends to join</div>
          <button
            className="btn btn-ghost btn-sm share-copy-btn"
            onClick={handleCopyCode}
          >
            📋 Copy Code
          </button>
        </div>

        <div className="player-section">
          <div className="section-label">
            Players ({room.players.length}/10)
          </div>
          <div className="player-list">
            {room.players.map((p, i) => {
              const playerIsHost = p.id === room.hostId;
              const isMe = p.id === myId;
              const bg = avatarColor(p.name);
              return (
                <div
                  className={`player-item ${isMe ? "is-me" : ""}`}
                  key={p.id}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="player-avatar" style={{ background: bg }}>
                    {avatarInitial(p.name)}
                    {playerIsHost && <div className="host-crown">👑</div>}
                  </div>
                  <span className="player-name">{p.name}</span>
                  <div className="player-badges">
                    {playerIsHost && (
                      <span className="player-badge host">Host</span>
                    )}
                    {isMe && <span className="player-badge me">You</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isHost && (
          <div className="settings-section">
            <div className="settings-label">⚙️ Game Settings</div>
            <div className="setting-row">
              <span className="setting-name">Starting cards</span>
              <div className="pill-group">
                {[5, 7, 10].map((n) => (
                  <button
                    key={n}
                    className={`pill ${startCards === n ? "active" : ""}`}
                    onClick={() => handleUpdateSettings(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rules-hint">
          <div className="rules-title">📋 House Rules</div>
          <ul className="rules-list">
            <li>Any card can be played - but wrong plays cost +2 cards!</li>
            <li>Call UNO when you have 1 card left or get caught!</li>
            <li>Wild cards are always free - no fine ever.</li>
          </ul>
        </div>
      </div>

      <div className="room-footer">
        {isHost ? (
          <button
            id="btn-start-game"
            className="btn btn-primary btn-full"
            disabled={!canStart || loading === "starting"}
            onClick={handleStart}
          >
            {loading === "starting" ? (
              <Loader size="small" text="Starting…" />
            ) : (
              `🎮 Start Game${!canStart ? " (need 2+ players)" : ""}`
            )}
          </button>
        ) : (
          <div className="waiting-text">
            <div className="waiting-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
            Waiting for host to start the game…
          </div>
        )}
      </div>
    </section>
  );
}
