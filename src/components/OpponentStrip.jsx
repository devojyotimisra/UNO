import { useGame } from "../context/GameContext";
import { avatarColor } from "../utils/avatars";
import socket from "../socket";
import "./OpponentStrip.css";

export default function OpponentStrip() {
  const { state } = useGame();
  const { gameState, myId, unoWindow } = state;
  if (!gameState) return null;

  const opponents = gameState.players.filter((p) => p.id !== myId);

  return (
    <div className="opponents-strip">
      {opponents.map((p) => {
        const isActive = p.id === gameState.currentPlayer;
        const isRisk = unoWindow?.playerId === p.id;
        const bg = avatarColor(p.name);

        return (
          <div
            key={p.id}
            className={`opponent-chip${isActive ? " active-turn" : ""}${isRisk ? " uno-risk" : ""}`}
          >
            {isActive && <div className="turn-ring" />}

            <div
              className="opponent-avatar"
              style={{ background: bg }}
              title={`${p.name} has ${p.cardCount} cards`}
            >
              {p.cardCount}
            </div>
            <div className="opponent-info">
              <span className="opponent-name">{p.name}</span>
            </div>

            {isRisk && p.id !== myId && (
              <button
                className="catch-btn-inline"
                onClick={() =>
                  socket.emit("catch_uno", { targetPlayerId: p.id })
                }
                title={`Catch ${p.name}!`}
              >
                🎯
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
