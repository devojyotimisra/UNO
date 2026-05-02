import { useGame } from "../context/GameContext";
import socket from "../socket";
import "./Overlays.css";

export function ColorPicker() {
  const { state, dispatch } = useGame();
  if (!state.showColorPicker) return null;

  const colors = [
    { name: "Red", value: "red", emoji: "🔴" },
    { name: "Green", value: "green", emoji: "🟢" },
    { name: "Blue", value: "blue", emoji: "🔵" },
    { name: "Yellow", value: "yellow", emoji: "🟡" },
  ];

  const handlePick = (color) => {
    socket.emit("play_card", {
      cardId: state.pendingWildCardId,
      chosenColor: color,
    });
    dispatch({ type: "HIDE_COLOR_PICKER" });
    dispatch({ type: "SELECT_CARD", payload: null });
  };

  const handleCancel = () => {
    dispatch({ type: "HIDE_COLOR_PICKER" });
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-label="Choose a color"
      onClick={handleCancel}
    >
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-icon">🎨</div>
        <div className="overlay-title">Choose a color</div>
        <div className="overlay-sub">Pick the color for the next player</div>
        <div className="color-grid">
          {colors.map((c) => (
            <button
              key={c.value}
              className="color-option"
              data-color={c.value}
              onClick={() => handlePick(c.value)}
            >
              <span className="color-emoji">{c.emoji}</span>
              <span className="color-name">{c.name}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
