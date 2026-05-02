import { useEffect, useState, useRef } from "react";
import { useGame } from "../context/GameContext";
import socket from "../socket";
import "./Overlays.css";

export function UnoOverlay() {
  const { state } = useGame();
  const { unoWindow, myId } = state;
  const [timerPct, setTimerPct] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!unoWindow) {
      setTimerPct(100);
      return;
    }

    const totalMs = unoWindow.expiresIn || 5000;
    const start = Date.now();
    const end = start + totalMs;

    setTimerPct(100);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const pct = Math.max(0, ((end - now) / totalMs) * 100);
      setTimerPct(pct);
      if (pct <= 0) clearInterval(intervalRef.current);
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [unoWindow]);

  if (!unoWindow) return null;

  const isMe = unoWindow.playerId === myId;
  const urgencyColor =
    timerPct > 50
      ? "var(--card-yellow)"
      : timerPct > 20
        ? "#ff9f1c"
        : "var(--card-red)";

  return (
    <div className="overlay" role="dialog" aria-label="UNO call window">
      <div className="overlay-sheet uno-sheet">
        <div className="uno-big-text">UNO!</div>
        <div className="uno-window-text">
          {isMe
            ? "🫵 Quick! Call UNO before someone catches you!"
            : `${unoWindow.playerName} has only 1 card left!`}
        </div>
        <div className="uno-timer-wrap">
          <div
            className="uno-timer-bar"
            style={{ width: `${timerPct}%`, background: urgencyColor }}
          />
        </div>
        <div className="uno-btn-row">
          {isMe ? (
            <button
              className="btn btn-full btn-uno"
              onClick={() => socket.emit("call_uno")}
            >
              🃏 UNO!
            </button>
          ) : (
            <button
              className="btn btn-full btn-catch"
              onClick={() =>
                socket.emit("catch_uno", { targetPlayerId: unoWindow.playerId })
              }
            >
              🎯 Catch {unoWindow.playerName}!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
