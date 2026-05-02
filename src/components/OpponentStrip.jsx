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
        const bg = avatarColor(p.name);
        return (
          <div
            key={p.id}
            className={`opponent-chip${isActive ? " active-turn" : ""}`}
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
          </div>
        );
      })}
    </div>
  );
}
