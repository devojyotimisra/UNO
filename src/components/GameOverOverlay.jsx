import { useEffect, useMemo } from "react";
import { useGame } from "../context/GameContext";
import socket from "../socket";
import "./Overlays.css";

const CONFETTI_COLORS = [
  "#e63946",
  "#f4c542",
  "#2a9d8f",
  "#4895ef",
  "#c77dff",
  "#ff9f1c",
  "#e94560",
  "#2ec4b6",
];
const CONFETTI_SHAPES = ["circle", "square", "strip"];

function Confetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 3,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 10,
      shape:
        CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      drift: (Math.random() - 0.5) * 200,
    }));
  }, []);

  return (
    <div className="confetti-container">
      {pieces.map((p) => {
        const shapeStyle = {
          left: `${p.left}%`,
          width: p.shape === "strip" ? `${p.size * 0.4}px` : `${p.size}px`,
          height: p.shape === "strip" ? `${p.size * 1.5}px` : `${p.size}px`,
          background: p.color,
          borderRadius:
            p.shape === "circle" ? "50%" : p.shape === "strip" ? "2px" : "2px",
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          transform: `rotate(${p.rotation}deg)`,
          "--drift": `${p.drift}px`,
        };
        return <div key={p.id} className="confetti-piece" style={shapeStyle} />;
      })}
    </div>
  );
}

export function GameOverOverlay() {
  const { state, dispatch } = useGame();
  const { gameOver, myId } = state;

  if (!gameOver) return null;

  const isWinner = gameOver.winner.id === myId;

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_TO_ROOM" });
  };

  const handleLeave = () => {
    socket.emit("leave_room");
    dispatch({ type: "RESET_TO_HOME" });
  };

  return (
    <>
      {isWinner && <Confetti />}
      <div className="overlay" role="dialog" aria-label="Game over">
        <div className="overlay-sheet gameover-sheet">
          <div className="gameover-trophy">{isWinner ? "🏆" : "😔"}</div>
          <div className="gameover-winner">
            {isWinner ? "🎉 You Won!" : `${gameOver.winner.name} Wins!`}
          </div>
          <div className="gameover-sub">
            {isWinner
              ? "Amazing! You got rid of all your cards!"
              : "Better luck next round! Keep playing!"}
          </div>
          <div className="gameover-btns">
            <button
              className="btn btn-primary gameover-btn"
              onClick={handlePlayAgain}
            >
              🔄 Play Again
            </button>
            <button
              className="btn btn-ghost gameover-btn"
              onClick={handleLeave}
            >
              🚪 Leave
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
